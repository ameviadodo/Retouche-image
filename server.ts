import express from 'express';
import { createServer as createViteServer } from 'vite';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const execFileAsync = promisify(execFile);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Augmentation de la limite du corps de requête pour supporter les images 4K/8K en base64
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Initialisation Gemini Server-Side (si clé disponible)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Cache des fichiers traités pour le téléchargement direct
const processedFilesCache = new Map<string, { filePath: string; createdAt: number; filename: string }>();

// Nettoyage régulier du cache (toutes les 15 minutes)
setInterval(async () => {
  const now = Date.now();
  for (const [token, item] of processedFilesCache.entries()) {
    if (now - item.createdAt > 3600 * 1000) {
      try {
        await fs.unlink(item.filePath).catch(() => {});
      } catch {}
      processedFilesCache.delete(token);
    }
  }
}, 15 * 60 * 1000);

// Helper pour extraire les données binaires d'un Data URL Base64
function parseBase64(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
  if (!matches) {
    // Si pas de préfixe data:image/...;base64,
    return { mimeType: 'image/png', buffer: Buffer.from(dataUrl, 'base64') };
  }
  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
  };
}

// 1. Liste des images exemples
app.get('/api/samples', (_req, res) => {
  res.json({
    samples: [
      {
        id: 'vintage',
        title: 'Archive Dégradée (1928)',
        category: 'Restauration & Rayures',
        url: '/samples/vintage_scratched.jpg',
        description: 'Photo d\'époque avec rayures profondes, pliures, poussières et jaunissement sepia.',
        suggestedCommands: ['/restore', '/scratchrepair', '/dustremove', '/colorize'],
      },
      {
        id: 'blurry',
        title: 'Mouvement Flou & Basse Résolution',
        category: 'Netteté & Défloutage',
        url: '/samples/blurry_street.jpg',
        description: 'Scène urbaine avec perte de mise au point et flou de bougé.',
        suggestedCommands: ['/unblur', '/sharpen', '/upscale4k', '/8k'],
      },
      {
        id: 'portrait',
        title: 'Portrait Studio Simulé',
        category: 'Beauté & Portrait',
        url: '/samples/portrait_sample.jpg',
        description: 'Portrait gros plan pour lissage de peau, éclat du regard et blanchiment des dents.',
        suggestedCommands: ['/faceenhance', '/skin', '/eyes', '/teeth', '/professionalheadshot', '/passport'],
      },
      {
        id: 'night',
        title: 'Nuit Urbaine Sous-Exposée (Bruit ISO)',
        category: 'Éclairage & Débruitage',
        url: '/samples/low_light_night.jpg',
        description: 'Cliché nocturne sombre avec fort bruit numérique de capteur et ombres bouchées.',
        suggestedCommands: ['/relight', '/denoise', '/exposure', '/hdr', '/contrast'],
      },
      {
        id: 'product',
        title: 'Montre de Luxe (Packshot)',
        category: 'E-Commerce & Style',
        url: '/samples/product_watch.jpg',
        description: 'Gros plan produit pour détourage fond blanc, style éditorial et textures.',
        suggestedCommands: ['/productphoto', '/removebg', '/cinematic', '/fashion', '/enhance'],
      },
    ],
  });
});

// 2. Traitement d'image principal via le script Python OpenCV / Pillow
app.post('/api/process', async (req, res) => {
  try {
    const { imageBase64, command, customParams, maskBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Données imageBase64 requises.' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const inputPath = `/tmp/ais_input_${token}.png`;
    const outputPath = `/tmp/ais_output_${token}.png`;
    const configPath = `/tmp/ais_config_${token}.json`;
    let maskPath: string | null = null;

    // Décodage et enregistrement de l'image source
    const { buffer: inputBuffer } = parseBase64(imageBase64);
    await fs.writeFile(inputPath, inputBuffer);

    // Si masque fourni pour /inpaint ou /scratchrepair
    if (maskBase64) {
      maskPath = `/tmp/ais_mask_${token}.png`;
      const { buffer: maskBuffer } = parseBase64(maskBase64);
      await fs.writeFile(maskPath, maskBuffer);
    }

    // Écriture de la configuration JSON pour Python
    const configData = {
      command: command || 'enhance',
      input_path: inputPath,
      output_path: outputPath,
      mask_path: maskPath,
      custom_params: customParams || {},
    };
    await fs.writeFile(configPath, JSON.stringify(configData));

    // Exécution du script Python vision_engine.py
    const scriptPath = path.resolve(process.cwd(), 'server/vision_engine.py');
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath, configPath], {
      timeout: 60000,
      maxBuffer: 50 * 1024 * 1024,
    });

    if (stderr && stderr.includes('Traceback')) {
      console.error('Erreur Python:', stderr);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution du script Python', details: stderr });
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(stdout.trim());
    } catch {
      console.error('Échec du parsing JSON stdout:', stdout);
      return res.status(500).json({ error: 'Format de réponse Python invalide', raw: stdout });
    }

    if (!parsedResult.success) {
      return res.status(500).json({ error: parsedResult.error || 'Erreur interne de traitement d\'image' });
    }

    // Lecture du fichier image résultat
    const outputBuffer = await fs.readFile(outputPath);
    const outputMime = 'image/png';
    const processedBase64 = `data:${outputMime};base64,${outputBuffer.toString('base64')}`;

    // Sauvegarde dans le cache de téléchargement
    const sanitizedCmd = (command || 'enhance').replace(/[^a-zA-Z0-9_-]/g, '');
    const downloadFilename = `studio_vision_${sanitizedCmd}_${parsedResult.metricsAfter.width}x${parsedResult.metricsAfter.height}.png`;
    processedFilesCache.set(token, {
      filePath: outputPath,
      createdAt: Date.now(),
      filename: downloadFilename,
    });

    // Nettoyage des fichiers temporaires (sauf l'output gardé pour téléchargement)
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(configPath).catch(() => {});
    if (maskPath) await fs.unlink(maskPath).catch(() => {});

    return res.json({
      success: true,
      downloadToken: token,
      downloadUrl: `/api/download/${token}`,
      processedImageBase64: processedBase64,
      metricsBefore: parsedResult.metricsBefore,
      metricsAfter: parsedResult.metricsAfter,
      algorithm: parsedResult.algorithm,
      durationSeconds: parsedResult.durationSeconds,
      reportSteps: parsedResult.reportSteps,
      pythonCode: parsedResult.pythonCode,
      command: parsedResult.command,
      stdout: stdout.length > 500 ? stdout.slice(0, 500) + '...' : stdout,
    });
  } catch (error: any) {
    console.error('Erreur API /api/process:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors du traitement d\'image.' });
  }
});

// 3. Téléchargement direct du fichier Haute Définition (HD, 2K, 4K, 8K)
app.get('/api/download/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const format = (req.query.format as string || 'png').toLowerCase();
    const quality = parseInt(req.query.quality as string || '100', 10);

    const cached = processedFilesCache.get(token);
    if (!cached || !(await fs.stat(cached.filePath).catch(() => false))) {
      return res.status(404).send('Fichier expiré ou non trouvé. Veuillez réexécuter le traitement.');
    }

    let serveFilePath = cached.filePath;
    let serveMime = 'image/png';
    let ext = 'png';

    // Si conversion demandée en JPG ou WebP
    if (format === 'jpeg' || format === 'jpg' || format === 'webp') {
      ext = format === 'jpeg' || format === 'jpg' ? 'jpg' : 'webp';
      serveMime = ext === 'jpg' ? 'image/jpeg' : 'image/webp';
      const convertedPath = `/tmp/converted_${token}_${quality}.${ext}`;

      // Conversion via Python OpenCV
      const convertScript = `
import cv2
img = cv2.imread("${cached.filePath}", cv2.IMREAD_UNCHANGED)
if "${ext}" == "jpg":
    if img.ndim == 3 and img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    cv2.imwrite("${convertedPath}", img, [cv2.IMWRITE_JPEG_QUALITY, ${Math.min(100, Math.max(1, quality))}])
elif "${ext}" == "webp":
    cv2.imwrite("${convertedPath}", img, [cv2.IMWRITE_WEBP_QUALITY, ${Math.min(100, Math.max(1, quality))}])
`;
      await execFileAsync('python3', ['-c', convertScript]);
      serveFilePath = convertedPath;
    }

    const downloadFilename = cached.filename.replace(/\.png$/, `.${ext}`);
    res.setHeader('Content-Type', serveMime);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    return res.sendFile(path.resolve(serveFilePath));
  } catch (err: any) {
    console.error('Erreur téléchargement:', err);
    return res.status(500).send('Erreur lors du téléchargement');
  }
});

// 4. Exécution de code Python personnalisé en direct dans la sandbox
app.post('/api/execute-python', async (req, res) => {
  try {
    const { pythonCode, imageBase64 } = req.body;
    if (!pythonCode) {
      return res.status(400).json({ error: 'Code Python requis.' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const inputPath = `/tmp/custom_input_${token}.png`;
    const outputPath = `/tmp/custom_output_${token}.png`;
    const scriptPath = `/tmp/custom_script_${token}.py`;

    if (imageBase64) {
      const { buffer } = parseBase64(imageBase64);
      await fs.writeFile(inputPath, buffer);
    }

    // Envelopper le code pour s'assurer que INPUT_PATH et OUTPUT_PATH sont injectés
    const wrappedCode = `
import sys, os, time, math, json
import cv2
import numpy as np
from PIL import Image

INPUT_PATH = "${inputPath}"
OUTPUT_PATH = "${outputPath}"

${pythonCode}
`;
    await fs.writeFile(scriptPath, wrappedCode);

    const startTime = Date.now();
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath], {
      timeout: 30000,
      maxBuffer: 20 * 1024 * 1024,
    });
    const execDuration = ((Date.now() - startTime) / 1000).toFixed(3);

    const outputExists = await fs.stat(outputPath).catch(() => false);
    let processedBase64: string | null = null;
    let downloadToken: string | null = null;

    if (outputExists) {
      const outBuffer = await fs.readFile(outputPath);
      processedBase64 = `data:image/png;base64,${outBuffer.toString('base64')}`;
      downloadToken = token;
      processedFilesCache.set(token, {
        filePath: outputPath,
        createdAt: Date.now(),
        filename: `custom_python_${token}.png`,
      });
    }

    // Nettoyage
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(scriptPath).catch(() => {});

    return res.json({
      success: true,
      stdout,
      stderr,
      durationSeconds: execDuration,
      processedBase64,
      downloadToken,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur d\'exécution du script Python',
      stderr: error.stderr || '',
      stdout: error.stdout || '',
    });
  }
});

// 5. Analyse rapide de métriques d'une image
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image requise' });
    }

    const token = crypto.randomBytes(8).toString('hex');
    const tempPath = `/tmp/analyze_${token}.png`;
    const { buffer } = parseBase64(imageBase64);
    await fs.writeFile(tempPath, buffer);

    const pyCode = `
import cv2, json
from server.vision_engine import compute_image_metrics
img = cv2.imread("${tempPath}", cv2.IMREAD_UNCHANGED)
metrics = compute_image_metrics(img)
print(json.dumps(metrics))
`;
    const { stdout } = await execFileAsync('python3', ['-c', pyCode]);
    await fs.unlink(tempPath).catch(() => {});

    return res.json({ success: true, metrics: JSON.parse(stdout.trim()) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Expertise IA & Conseils Photographiques (Gemini 3.8 Flash Server-Side)
app.post('/api/gemini-appraisal', async (req, res) => {
  try {
    const { imageBase64, metrics } = req.body;
    if (!aiClient) {
      return res.status(200).json({
        available: false,
        message: 'Clé API Gemini non configurée dans Settings > Secrets. Le moteur algorithmique Python OpenCV reste 100% opérationnel.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Vous êtes l'ingénieur en chef d'un studio d'imagerie de pointe.
Analysez cette image et ses métriques (Résolution: ${metrics?.width}x${metrics?.height}, Netteté Laplacien: ${metrics?.laplacianVariance}, SNR: ${metrics?.snrDb} dB).
Fournissez un diagnostic en français structuré :
1. Diagnostic des défauts (bruit, exposition, piqué, chrominance, rayures éventuelles)
2. Commandes recommandées parmi (/upscale4k, /restore, /scratchrepair, /unblur, /denoise, /hdr, /faceenhance, /colorcorrect, /cinematic, /enhance)
3. Justification technique concise (150 mots max).`,
          },
        ],
      },
    });

    return res.json({
      available: true,
      analysis: response.text || 'Diagnostic non disponible.',
    });
  } catch (err: any) {
    console.error('Erreur Gemini Appraisal:', err);
    return res.json({
      available: false,
      message: 'Service Gemini temporairement indisponible.',
    });
  }
});

// Montage de Vite en mode développement ou des fichiers statiques en production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Studio Vision] Serveur démarré avec succès sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erreur de démarrage du serveur:', err);
});

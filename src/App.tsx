/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageWorkspace } from './components/ImageWorkspace';
import { CommandPanel } from './components/CommandPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { QuickCommandBar } from './components/QuickCommandBar';
import { SampleModal } from './components/SampleModal';
import { ExportModal } from './components/ExportModal';
import { ImageMetrics, ProcessResult, SampleItem } from './types';
import { COMMANDS } from './data/commands';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ImageMetrics | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [activeCommandKey, setActiveCommandKey] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [targetResolution, setTargetResolution] = useState<string>('native');
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Inpaint Mask
  const [isInpaintMode, setIsInpaintMode] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [maskHasContent, setMaskHasContent] = useState<boolean>(false);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Python Terminal & IA
  const [pythonTerminalOutput, setPythonTerminalOutput] = useState<string | null>(null);
  const [geminiAppraisal, setGeminiAppraisal] = useState<string | null>(null);
  const [isAppraising, setIsAppraising] = useState<boolean>(false);
  const [isExecutingPython, setIsExecutingPython] = useState<boolean>(false);

  // Hidden File input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les images exemples au démarrage
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples) {
          setSamples(data.samples);
          // Charger le premier exemple par défaut pour que l'utilisateur découvre immédiatement l'app
          if (data.samples.length > 0 && !originalImage) {
            handleLoadSample(data.samples[0]);
          }
        }
      })
      .catch((err) => console.error('Erreur chargement samples:', err));
  }, []);

  // Détection du contenu du masque
  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const checkMask = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 20) {
          setMaskHasContent(true);
          return;
        }
      }
      setMaskHasContent(false);
    };

    const interval = setInterval(checkMask, 500);
    return () => clearInterval(interval);
  }, []);

  // Charger un fichier image local
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setOriginalImage(base64);
      setProcessedImage(null);
      setResult(null);
      setActiveCommandKey(undefined);
      setGeminiAppraisal(null);
      handleClearMask();
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Charger un échantillon
  const handleLoadSample = async (sample: SampleItem) => {
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setOriginalImage(base64);
        setProcessedImage(null);
        setResult(null);
        setActiveCommandKey(undefined);
        setGeminiAppraisal(null);
        handleClearMask();
        await analyzeImage(base64);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Erreur chargement exemple:', err);
    }
  };

  // Analyse rapide OpenCV (métriques, histogramme, netteté)
  const analyzeImage = async (base64: string) => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Erreur analyse image:', err);
    }
  };

  // Effacer le masque
  const handleClearMask = () => {
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setMaskHasContent(false);
  };

  // Exécution d'une commande de traitement (/upscale4k, /faceenhance, etc.)
  const handleRunCommand = async (commandKey: string, customParams?: Record<string, any>) => {
    if (!originalImage || isProcessing) return;

    setIsProcessing(true);
    setActiveCommandKey(commandKey);
    const cmdMeta = COMMANDS.find((c) => c.key === commandKey);
    setProcessingStep(`Exécution Python OpenCV : ${cmdMeta?.name || commandKey}...`);

    try {
      // Extraction du masque si dessiné
      let maskBase64: string | null = null;
      if (maskCanvasRef.current && maskHasContent) {
        maskBase64 = maskCanvasRef.current.toDataURL('image/png');
      }

      // Fusionner résolution cible si sélectionnée
      const finalParams = {
        ...(customParams || {}),
        targetResolution,
      };

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalImage,
          command: commandKey,
          customParams: finalParams,
          maskBase64,
        }),
      });

      const data: ProcessResult = await res.json();
      if (data.success) {
        setResult(data);
        setProcessedImage(data.processedImageBase64);
        setMetrics(data.metricsAfter);
        setPythonTerminalOutput(
          `[SUCCESS] Commande ${commandKey} exécutée en ${data.durationSeconds}s.\n[ALGO] ${data.algorithm}\n[RESOLUTION] ${data.metricsBefore.width}x${data.metricsBefore.height} -> ${data.metricsAfter.width}x${data.metricsAfter.height}\n[INFO] Fichier haute définition disponible au téléchargement.`
        );
      } else {
        alert('Erreur de traitement : ' + ((data as any).error || 'Erreur inconnue'));
      }
    } catch (err: any) {
      console.error('Erreur lors du traitement:', err);
      alert('Erreur lors de la communication avec le moteur Python.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Exécution directe de code Python personnalisé
  const handleExecuteCustomPython = async (code: string) => {
    if (!originalImage || isExecutingPython) return;

    setIsExecutingPython(true);
    try {
      const res = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pythonCode: code,
          imageBase64: originalImage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.processedBase64) {
          setProcessedImage(data.processedBase64);
        }
        setPythonTerminalOutput(
          `[SANDBOX] Script exécuté en ${data.durationSeconds}s.\n--- STDOUT ---\n${data.stdout || '(aucun texte)'}\n--- STDERR ---\n${data.stderr || '(aucun avertissement)'}`
        );
      } else {
        setPythonTerminalOutput(
          `[ERREUR PYTHON]\n${data.error}\n${data.stderr || ''}`
        );
      }
    } catch (err: any) {
      setPythonTerminalOutput(`[ERREUR SANDBOX] ${err.message}`);
    } finally {
      setIsExecutingPython(false);
    }
  };

  // Demander un diagnostic photographique expert IA
  const handleRequestGeminiAppraisal = async () => {
    if (!originalImage || isAppraising) return;

    setIsAppraising(true);
    try {
      const res = await fetch('/api/gemini-appraisal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalImage,
          metrics,
        }),
      });
      const data = await res.json();
      if (data.available && data.analysis) {
        setGeminiAppraisal(data.analysis);
      } else {
        setGeminiAppraisal(data.message || 'Diagnostic IA indisponible sans clé API configurée.');
      }
    } catch (err: any) {
      setGeminiAppraisal('Erreur lors de la communication avec le service Gemini.');
    } finally {
      setIsAppraising(false);
    }
  };

  const handleResetOriginal = () => {
    setProcessedImage(null);
    setResult(null);
    setActiveCommandKey(undefined);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Top Header */}
      <Header
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenSamples={() => setIsSampleModalOpen(true)}
        onExportClick={() => setIsExportModalOpen(true)}
        onResetOriginal={handleResetOriginal}
        hasImage={!!originalImage}
        hasResult={!!processedImage}
        targetResolution={targetResolution}
        setTargetResolution={setTargetResolution}
        isProcessing={isProcessing}
      />

      {/* Main Studio Body (3-Column Layout: Left Commands, Center Canvas, Right Inspector) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left : Command Deck */}
        <CommandPanel
          onRunCommand={handleRunCommand}
          activeCommandKey={activeCommandKey}
          isProcessing={isProcessing}
          hasImage={!!originalImage}
        />

        {/* Center : Interactive Comparison Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-zinc-950">
          <ImageWorkspace
            originalImage={originalImage}
            processedImage={processedImage}
            activeCommandName={activeCommandKey}
            isProcessing={isProcessing}
            processingStep={processingStep}
            onImageDrop={handleFileUpload}
            onOpenSamples={() => setIsSampleModalOpen(true)}
            maskCanvasRef={maskCanvasRef}
            isInpaintMode={isInpaintMode}
            setIsInpaintMode={setIsInpaintMode}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            onClearMask={handleClearMask}
            maskHasContent={maskHasContent}
          />

          {/* Bottom Quick Command Line */}
          <QuickCommandBar
            onRunCommand={handleRunCommand}
            isProcessing={isProcessing}
            hasImage={!!originalImage}
          />
        </div>

        {/* Right : Scientific Inspector & Python Sandbox */}
        <InspectorPanel
          result={result}
          metrics={metrics}
          onExecuteCustomPython={handleExecuteCustomPython}
          onExportClick={() => setIsExportModalOpen(true)}
          onRequestGeminiAppraisal={handleRequestGeminiAppraisal}
          geminiAppraisal={geminiAppraisal}
          isAppraising={isAppraising}
          isExecutingPython={isExecutingPython}
          pythonTerminalOutput={pythonTerminalOutput}
        />
      </div>

      {/* Sample Picker Modal */}
      <SampleModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        samples={samples}
        onSelectSample={handleLoadSample}
      />

      {/* Export / Download Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={result}
        downloadUrl={result?.downloadUrl || null}
        targetResolution={targetResolution}
      />
    </div>
  );
}

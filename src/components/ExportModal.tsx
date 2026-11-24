import React, { useState } from 'react';
import { X, Download, FileImage, Check, Sparkles, Layers } from 'lucide-react';
import { ProcessResult } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ProcessResult | null;
  downloadUrl: string | null;
  targetResolution: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
  downloadUrl,
  targetResolution,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(95);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!downloadUrl) return;
    setIsDownloading(true);

    const fullUrl = `${downloadUrl}?format=${format}&quality=${quality}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Exportation Haute Résolution
              </h3>
              <p className="text-xs text-zinc-400">
                Fichier calibré haute définition prêt au téléchargement.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formats and Settings */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          {result && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400 font-mono">
                <span>Définition de sortie :</span>
                <span className="text-white font-bold">
                  {result.metricsAfter.width} × {result.metricsAfter.height} px
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 font-mono">
                <span>Poids pixel :</span>
                <span className="text-indigo-400 font-bold">{result.metricsAfter.megapixels} Mégapixels</span>
              </div>
              <div className="flex justify-between text-zinc-400 font-mono">
                <span>Algorithme :</span>
                <span className="text-zinc-300">{result.algorithm}</span>
              </div>
            </div>
          )}

          {/* Format Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider block">
              Format de fichier :
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'png', name: 'PNG', desc: 'Sans perte (Master)' },
                { id: 'jpeg', name: 'JPEG', desc: 'Compressé HD' },
                { id: 'webp', name: 'WebP', desc: 'Ultra compact' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    format === f.id
                      ? 'bg-indigo-950/40 border-indigo-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{f.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG / WebP) */}
          {(format === 'jpeg' || format === 'webp') && (
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Qualité de compression :</span>
                <span className="font-mono text-indigo-400 font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Download Trigger */}
          <button
            onClick={handleDownload}
            disabled={isDownloading || !downloadUrl}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Génération du flux en cours...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger le Fichier ({format.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

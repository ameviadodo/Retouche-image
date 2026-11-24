import React from 'react';
import { 
  Sparkles, 
  Upload, 
  Download, 
  RotateCcw, 
  Sliders, 
  Image as ImageIcon,
  Cpu,
  Layers
} from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onOpenSamples: () => void;
  onExportClick: () => void;
  onResetOriginal: () => void;
  hasImage: boolean;
  hasResult: boolean;
  targetResolution: string;
  setTargetResolution: (res: string) => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onOpenSamples,
  onExportClick,
  onResetOriginal,
  hasImage,
  hasResult,
  targetResolution,
  setTargetResolution,
  isProcessing,
}) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Logo & Vision Engine Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm md:text-base tracking-tight text-white flex items-center gap-1.5">
              <span>STUDIO VISION ADVANCED</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                PRO 4K/8K
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Moteur Python · OpenCV 4.6 · Pillow</span>
          </div>
        </div>
      </div>

      {/* Target Resolution & Studio Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
          <span className="px-2 text-zinc-400 flex items-center gap-1 font-mono text-[11px]">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            Cible :
          </span>
          {(['native', '1080p', '2k', '4k', '8k'] as const).map((res) => (
            <button
              key={res}
              onClick={() => setTargetResolution(res)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                targetResolution === res
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {res.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <button
          onClick={onOpenSamples}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
          title="Charger une photo d'archive ou de test haute résolution"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Exemples</span>
        </button>

        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 hover:border-zinc-600 transition-all cursor-pointer shadow-sm"
          title="Importer une image (PNG, JPG, WEBP, TIFF)"
        >
          <Upload className="w-3.5 h-3.5 text-violet-400" />
          <span>Importer</span>
        </button>

        {hasResult && (
          <button
            onClick={onResetOriginal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
            title="Revenir à l'image source originale"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Originale</span>
          </button>
        )}

        <button
          onClick={onExportClick}
          disabled={!hasImage || isProcessing}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
            hasImage && !isProcessing
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
          }`}
          title="Télécharger l'image en haute résolution HD, 2K, 4K ou 8K"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter Haute Définition</span>
        </button>
      </div>
    </header>
  );
};

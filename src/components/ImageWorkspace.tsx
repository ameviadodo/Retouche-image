import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  SplitSquareVertical, 
  Columns, 
  Eye, 
  Paintbrush, 
  Eraser, 
  Trash2,
  Upload,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface ImageWorkspaceProps {
  originalImage: string | null;
  processedImage: string | null;
  activeCommandName?: string;
  isProcessing: boolean;
  processingStep?: string;
  onImageDrop: (file: File) => void;
  onOpenSamples: () => void;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isInpaintMode: boolean;
  setIsInpaintMode: (val: boolean) => void;
  brushSize: number;
  setBrushSize: (val: number) => void;
  onClearMask: () => void;
  maskHasContent: boolean;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  originalImage,
  processedImage,
  activeCommandName,
  isProcessing,
  processingStep,
  onImageDrop,
  onOpenSamples,
  maskCanvasRef,
  isInpaintMode,
  setIsInpaintMode,
  brushSize,
  setBrushSize,
  onClearMask,
  maskHasContent,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side' | 'processed' | 'original'>('split');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDrawingMask, setIsDrawingMask] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingOver = useRef<boolean>(false);
  const [dragOverState, setDragOverState] = useState<boolean>(false);

  // Drag & drop fichiers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragOverState) setDragOverState(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverState(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverState(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageDrop(file);
      }
    }
  };

  // Gestion du curseur split avant/après
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInpaintMode) {
      startDrawingMask(e);
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Pan
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isDrawingMask && isInpaintMode) {
      drawMask(e);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingSlider(false);
    setIsPanning(false);
    setIsDrawingMask(false);
  };

  // Dessin sur le masque d'inpainting
  const startDrawingMask = (e: React.MouseEvent) => {
    if (!maskCanvasRef.current) return;
    setIsDrawingMask(true);
    drawMask(e);
  };

  const drawMask = (e: React.MouseEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.75)'; // Rouge semi-transparent
    ctx.beginPath();
    ctx.arc(x, y, brushSize * (scaleX / zoom), 0, Math.PI * 2);
    ctx.fill();
  };

  // Réinitialiser zoom
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPos(50);
  };

  // Zoom avec la molette
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      setZoom((prev) => Math.min(5, Math.max(0.3, prev * zoomFactor)));
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 bg-zinc-950 overflow-hidden select-none flex items-center justify-center ${
        dragOverState ? 'ring-2 ring-indigo-500 bg-indigo-950/20' : ''
      }`}
    >
      {/* Top Floating View Controls */}
      {originalImage && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1 rounded-xl border border-zinc-800 shadow-2xl">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="Curseur interactif de comparaison Avant / Après"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Slider</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'side-by-side' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="Vue double synchronisée côte-à-côte"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Côte-à-Côte</span>
          </button>

          <button
            onClick={() => setViewMode('processed')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'processed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="Vue Résultat Après"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Après</span>
          </button>

          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'original' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="Vue Originale Avant"
          >
            <span className="text-zinc-400 font-mono text-[11px]">Avant</span>
          </button>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

          {/* Inpaint Mask Toggle */}
          <button
            onClick={() => setIsInpaintMode(!isInpaintMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isInpaintMode
                ? 'bg-rose-600 text-white shadow-rose-600/30 shadow-md ring-1 ring-rose-400'
                : 'text-zinc-400 hover:text-rose-300 hover:bg-zinc-800'
            }`}
            title="Pinceau de Masquage pour /inpaint, /scratchrepair ou /removeobject"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pinceau Retouche</span>
          </button>
        </div>
      )}

      {/* Floating Zoom & Pan Bar */}
      {originalImage && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md p-1 rounded-xl border border-zinc-800 shadow-2xl">
          <button
            onClick={() => setZoom((prev) => Math.max(0.3, prev - 0.25))}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Zoom Arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-zinc-300 px-2 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((prev) => Math.min(5, prev + 0.25))}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Zoom Avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={resetView}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Réinitialiser vue 100%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inpaint Brush Controls Bar */}
      {isInpaintMode && originalImage && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-3 bg-zinc-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-500/40 shadow-2xl">
          <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
            <Paintbrush className="w-3.5 h-3.5 text-rose-400" />
            <span>Taille Pinceau :</span>
          </div>

          <input
            type="range"
            min={4}
            max={70}
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
            className="w-24 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <span className="text-[11px] font-mono text-zinc-400 w-8 text-right">
            {brushSize}px
          </span>

          <button
            onClick={onClearMask}
            disabled={!maskHasContent}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition-colors"
            title="Effacer le masque dessiné"
          >
            <Trash2 className="w-3 h-3 text-zinc-400" />
            <span>Effacer</span>
          </button>
        </div>
      )}

      {/* État : Aucune image chargée */}
      {!originalImage && (
        <div className="max-w-md w-full mx-4 p-8 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 text-center flex flex-col items-center justify-center backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
            Glissez-déposez une image ici
          </h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed max-w-xs">
            Formats acceptés : PNG, JPEG, WEBP, TIFF. Résolution jusqu'à 8K supportée nativement.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <label className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/20 transition-all">
              <Upload className="w-4 h-4" />
              <span>Parcourir les fichiers</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onImageDrop(e.target.files[0]);
                  }
                }}
              />
            </label>

            <button
              onClick={onOpenSamples}
              className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Essayer un exemple</span>
            </button>
          </div>
        </div>
      )}

      {/* Visualiseur d'image actif */}
      {originalImage && (
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Mode 1 : Split Slider */}
          {viewMode === 'split' && (
            <div className="relative select-none max-h-[80vh] flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-zinc-800">
              {/* Image Originale (Arrière-plan / Gauche) */}
              <img
                src={originalImage}
                alt="Avant"
                className="max-h-[75vh] w-auto max-w-[85vw] object-contain pointer-events-none block"
              />

              {/* Image Traitée (Superposée avec clip-path selon sliderPos) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
                }}
              >
                <img
                  src={processedImage || originalImage}
                  alt="Après"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>

              {/* Ligne séparatrice interactive du Split Slider */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10 cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider(true);
                }}
              >
                <div className="w-7 h-7 rounded-full bg-white text-zinc-900 shadow-xl flex items-center justify-center text-[10px] font-bold border border-zinc-300">
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Badges d'état Avant / Après */}
              <div className="absolute bottom-3 left-3 pointer-events-none px-2.5 py-1 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-zinc-300 uppercase tracking-wider border border-white/10 z-10">
                Avant (Original)
              </div>
              <div className="absolute bottom-3 right-3 pointer-events-none px-2.5 py-1 rounded bg-indigo-950/80 backdrop-blur text-[10px] font-mono text-indigo-300 uppercase tracking-wider border border-indigo-500/30 z-10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>Après ({activeCommandName || 'Vision HD'})</span>
              </div>
            </div>
          )}

          {/* Mode 2 : Côte-à-Côte */}
          {viewMode === 'side-by-side' && (
            <div className="flex items-center gap-4 max-h-[75vh] max-w-[90vw]">
              <div className="relative border border-zinc-800 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
                <img
                  src={originalImage}
                  alt="Avant"
                  className="max-h-[70vh] w-auto object-contain pointer-events-none"
                />
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-300">
                  Avant
                </div>
              </div>

              <div className="relative border border-indigo-500/30 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
                <img
                  src={processedImage || originalImage}
                  alt="Après"
                  className="max-h-[70vh] w-auto object-contain pointer-events-none"
                />
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-indigo-900/80 text-[10px] font-mono text-indigo-300">
                  Après ({activeCommandName || '4K'})
                </div>
              </div>
            </div>
          )}

          {/* Mode 3 : Traitée seule */}
          {viewMode === 'processed' && (
            <div className="relative border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
              <img
                src={processedImage || originalImage}
                alt="Après"
                className="max-h-[75vh] w-auto max-w-[85vw] object-contain pointer-events-none"
              />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-indigo-950/80 text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                Après ({activeCommandName || 'Rendu Final'})
              </div>
            </div>
          )}

          {/* Mode 4 : Originale seule */}
          {viewMode === 'original' && (
            <div className="relative border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
              <img
                src={originalImage}
                alt="Avant"
                className="max-h-[75vh] w-auto max-w-[85vw] object-contain pointer-events-none"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/70 text-[10px] font-mono text-zinc-300 border border-white/10">
                Originale
              </div>
            </div>
          )}

          {/* Canevas de Masquage d'Inpainting Superposé */}
          <canvas
            ref={maskCanvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-${isInpaintMode ? 'auto' : 'none'} ${
              isInpaintMode ? 'cursor-crosshair' : ''
            }`}
            style={{ display: isInpaintMode ? 'block' : 'none' }}
          />
        </div>
      )}

      {/* Animation Haute Précision de Traitement Python / OpenCV */}
      {isProcessing && (
        <div className="absolute inset-0 z-30 bg-zinc-950/75 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="relative w-72 p-6 rounded-2xl bg-zinc-900 border border-indigo-500/30 shadow-2xl flex flex-col items-center text-center">
            {/* Hologram Scanner */}
            <div className="relative w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 overflow-hidden">
              <Cpu className="w-8 h-8 animate-pulse text-indigo-400" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent animate-scan" />
            </div>

            <h4 className="text-sm font-bold text-white mb-1">
              Calcul Vision en Cours
            </h4>
            <p className="text-xs text-zinc-400 mb-3 font-mono">
              {processingStep || 'Exécution script Python OpenCV / Pillow...'}
            </p>

            {/* Micro barre de progression indéterminée */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 rounded-full animate-indeterminate" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

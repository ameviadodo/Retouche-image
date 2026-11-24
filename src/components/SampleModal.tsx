import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { SampleItem } from '../types';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: SampleItem[];
  onSelectSample: (sample: SampleItem) => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  samples,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Galerie d'Images de Test Professionnelles
              </h3>
              <p className="text-xs text-zinc-400">
                Sélectionnez un cas d'usage réel pour tester immédiatement les algorithmes OpenCV et Pillow.
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

        {/* Grid of Samples */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {samples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="group cursor-pointer rounded-xl border border-zinc-800/80 hover:border-indigo-500/50 bg-zinc-950/60 hover:bg-zinc-950 overflow-hidden transition-all flex flex-col shadow-md"
            >
              <div className="h-36 w-full overflow-hidden bg-zinc-900 relative">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-black/70 text-zinc-300 backdrop-blur">
                  {sample.category}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    {sample.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {sample.suggestedCommands.slice(0, 2).map((cmd) => (
                      <span
                        key={cmd}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {cmd}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] text-indigo-400 flex items-center gap-0.5 font-medium">
                    <span>Charger</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

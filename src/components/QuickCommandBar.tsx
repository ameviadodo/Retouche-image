import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Sparkles } from 'lucide-react';
import { COMMANDS } from '../data/commands';

interface QuickCommandBarProps {
  onRunCommand: (commandKey: string) => void;
  isProcessing: boolean;
  hasImage: boolean;
}

const POPULAR_COMMANDS = [
  { key: '/upscale4k', label: '🌟 4K Ultra Net' },
  { key: '/restore', label: '🎨 Restaurer Photo' },
  { key: '/faceenhance', label: '👤 Beauté Visage' },
  { key: '/hdr', label: '💡 Rendu HDR' },
  { key: '/cinematic', label: '🎬 Cinéma 35mm' },
  { key: '/removebg', label: '✂️ Détourer' },
  { key: '/enhance', label: '✨ Auto Pro' },
];

export const QuickCommandBar: React.FC<QuickCommandBarProps> = ({
  onRunCommand,
  isProcessing,
  hasImage,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggestions filtrées
  const suggestions = COMMANDS.filter((c) => {
    const q = inputVal.trim().toLowerCase();
    return q && (c.key.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }).slice(0, 6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !hasImage || isProcessing) return;

    let targetKey = inputVal.trim().toLowerCase();
    if (!targetKey.startsWith('/')) {
      targetKey = '/' + targetKey;
    }

    onRunCommand(targetKey);
    setInputVal('');
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (cmdKey: string) => {
    onRunCommand(cmdKey);
    setInputVal('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative border-t border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 py-2.5 flex items-center justify-between gap-4 z-20">
      {/* Quick Pills Carousel */}
      <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Raccourcis :
        </span>
        {POPULAR_COMMANDS.map((item) => (
          <button
            key={item.key}
            onClick={() => onRunCommand(item.key)}
            disabled={!hasImage || isProcessing}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs text-zinc-300 hover:text-white border border-zinc-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Interactive Command Input Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Terminal className="w-3.5 h-3.5 text-indigo-400 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Tapez une commande (ex: /upscale4k, /denoise, /sharpen...)"
            disabled={!hasImage || isProcessing}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-10 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || !hasImage || isProcessing}
            className="absolute right-1.5 p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-transparent disabled:text-zinc-600 text-white transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>

        {/* Floating Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-1 z-30">
            {suggestions.map((cmd) => (
              <button
                key={cmd.key}
                type="button"
                onClick={() => handleSelectSuggestion(cmd.key)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-zinc-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <code className="text-indigo-400 font-mono font-bold">{cmd.key}</code>
                  <span className="text-zinc-300">{cmd.name}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">
                  {cmd.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

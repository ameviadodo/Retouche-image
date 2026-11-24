import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  ChevronRight, 
  Sliders, 
  Play, 
  Check,
  Maximize2,
  Tv,
  MonitorPlay,
  Focus,
  Eye,
  ShieldAlert,
  History,
  PenTool,
  Sparkle,
  Palette,
  SunMedium,
  Pipette,
  Gauge,
  Aperture,
  Smile,
  Briefcase,
  IdCard,
  ShoppingBag,
  Camera,
  Film,
  Lightbulb,
  Clock,
  Layers,
  Instagram,
  PlaySquare,
  Scissors,
  Image as ImageIcon,
  Eraser,
  Brush,
  Maximize,
  Wand2
} from 'lucide-react';
import { COMMANDS, COMMAND_CATEGORIES } from '../data/commands';
import { CommandDef } from '../types';

// Map des icônes dynamiques
const ICON_MAP: Record<string, React.ElementType> = {
  Maximize2,
  Tv,
  MonitorPlay,
  Focus,
  Eye,
  ShieldAlert,
  History,
  PenTool,
  Sparkle,
  Palette,
  SunMedium,
  Pipette,
  Gauge,
  Aperture,
  Smile,
  Briefcase,
  IdCard,
  ShoppingBag,
  Camera,
  Film,
  Lightbulb,
  Clock,
  Layers,
  Instagram,
  PlaySquare,
  Scissors,
  Image: ImageIcon,
  Eraser,
  Brush,
  Maximize,
  Wand2,
  Sparkles,
};

interface CommandPanelProps {
  onRunCommand: (commandKey: string, params?: Record<string, any>) => void;
  activeCommandKey?: string;
  isProcessing: boolean;
  hasImage: boolean;
}

export const CommandPanel: React.FC<CommandPanelProps> = ({
  onRunCommand,
  activeCommandKey,
  isProcessing,
  hasImage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
  const [commandParams, setCommandParams] = useState<Record<string, Record<string, any>>>({});

  // Filtrage des commandes selon catégorie et recherche
  const filteredCommands = useMemo(() => {
    return COMMANDS.filter((cmd) => {
      const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        cmd.key.toLowerCase().includes(q) ||
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.technicalDetails.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleParamChange = (cmdKey: string, paramName: string, value: any) => {
    setCommandParams((prev) => ({
      ...prev,
      [cmdKey]: {
        ...(prev[cmdKey] || {}),
        [paramName]: value,
      },
    }));
  };

  const getParamValue = (cmd: CommandDef, param: any) => {
    return commandParams[cmd.key]?.[param.name] ?? param.default;
  };

  const handleTrigger = (cmd: CommandDef) => {
    const params = commandParams[cmd.key] || {};
    onRunCommand(cmd.key, params);
  };

  return (
    <aside className="w-80 md:w-96 border-r border-zinc-800 bg-zinc-950/95 flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Search Header */}
      <div className="p-3.5 border-b border-zinc-800 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une commande (ex: /upscale4k, /hdr, peau...)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {COMMAND_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all flex items-center gap-1 font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Command List Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredCommands.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            Aucune commande trouvée pour "{searchQuery}".
          </div>
        ) : (
          filteredCommands.map((cmd) => {
            const Icon = ICON_MAP[cmd.iconName] || Sparkles;
            const isActive = activeCommandKey === cmd.key;
            const isExpanded = expandedCommand === cmd.key;
            const hasParams = cmd.params && cmd.params.length > 0;

            return (
              <div
                key={cmd.key}
                className={`group rounded-xl border transition-all ${
                  isActive
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/30'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-indigo-400'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-bold text-indigo-400 font-mono tracking-tight">
                            {cmd.key}
                          </code>
                          {cmd.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {cmd.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-medium text-zinc-200 leading-tight">
                          {cmd.name}
                        </h4>
                      </div>
                    </div>

                    {/* Action Run Button */}
                    <button
                      onClick={() => handleTrigger(cmd)}
                      disabled={!hasImage || isProcessing}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm ${
                        isActive
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Appliqué</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Lancer</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed pl-9 mb-2">
                    {cmd.description}
                  </p>

                  <div className="pl-9 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/60 pt-2 font-mono">
                    <span className="truncate pr-2" title={cmd.technicalDetails}>
                      ⚙️ {cmd.technicalDetails}
                    </span>

                    {hasParams && (
                      <button
                        onClick={() => setExpandedCommand(isExpanded ? null : cmd.key)}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 font-sans"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{isExpanded ? 'Réduire' : 'Régler'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Panneau de réglages fins (sliders/options) */}
                {hasParams && isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 bg-zinc-950/40 rounded-b-xl space-y-2">
                    {cmd.params?.map((p) => {
                      const val = getParamValue(cmd, p);
                      return (
                        <div key={p.name} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>{p.label}</span>
                            <span className="font-mono text-indigo-400 font-semibold">{val}</span>
                          </div>

                          {p.type === 'slider' && (
                            <input
                              type="range"
                              min={p.min}
                              max={p.max}
                              step={p.step}
                              value={val}
                              onChange={(e) => handleParamChange(cmd.key, p.name, parseFloat(e.target.value))}
                              className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          )}

                          {p.type === 'select' && (
                            <select
                              value={val}
                              onChange={(e) => handleParamChange(cmd.key, p.name, e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                            >
                              {p.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { 
  BarChart3, 
  Terminal, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Clock, 
  Cpu, 
  ArrowUpRight, 
  ShieldCheck, 
  FileCode,
  Info
} from 'lucide-react';
import { ImageMetrics, ProcessResult } from '../types';

interface InspectorPanelProps {
  result: ProcessResult | null;
  metrics: ImageMetrics | null;
  onExecuteCustomPython: (code: string) => Promise<void>;
  onExportClick: () => void;
  onRequestGeminiAppraisal: () => Promise<void>;
  geminiAppraisal: string | null;
  isAppraising: boolean;
  isExecutingPython: boolean;
  pythonTerminalOutput: string | null;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  result,
  metrics,
  onExecuteCustomPython,
  onExportClick,
  onRequestGeminiAppraisal,
  geminiAppraisal,
  isAppraising,
  isExecutingPython,
  pythonTerminalOutput,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'python' | 'ai'>('metrics');
  const [copiedCode, setCopiedCode] = useState(false);
  const [customCode, setCustomCode] = useState<string>('');

  const currentMetrics = result?.metricsAfter || metrics;
  const beforeMetrics = result?.metricsBefore;

  // Initialisation du code python personnalisable
  React.useEffect(() => {
    if (result?.pythonCode) {
      setCustomCode(result.pythonCode);
    }
  }, [result?.pythonCode]);

  const handleCopyCode = () => {
    if (customCode || result?.pythonCode) {
      navigator.clipboard.writeText(customCode || result?.pythonCode || '');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const calculateGain = (before?: number, after?: number) => {
    if (before === undefined || after === undefined || before === 0) return null;
    const diff = ((after - before) / before) * 100;
    return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
  };

  return (
    <aside className="w-80 md:w-96 border-l border-zinc-800 bg-zinc-950/95 flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Tab Navigation Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-2 bg-zinc-900/50">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'metrics'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Métriques & Rapport</span>
        </button>

        <button
          onClick={() => setActiveTab('python')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'python'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sandbox Python</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Expertise IA</span>
        </button>
      </div>

      {/* Tab 1 : Rapport & Métriques */}
      {activeTab === 'metrics' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Download Action Banner (if result ready) */}
          {result && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-violet-950/40 border border-indigo-500/40 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                  Traitement Terminé en {result.durationSeconds}s
                </span>
                <h4 className="text-xs font-semibold text-white">
                  Fichier Haute Définition Prêt
                </h4>
              </div>

              <button
                onClick={onExportClick}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </button>
            </div>
          )}

          {/* Comparatif Avant / Après */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between font-mono">
              <span>Métriques Scientifiques</span>
              {result && (
                <span className="text-[10px] text-emerald-400 font-normal">
                  ● Mesure OpenCV
                </span>
              )}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {/* Résolution */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Résolution & Définition
                </span>
                <div className="text-sm font-bold text-white font-mono">
                  {currentMetrics?.width || 0} × {currentMetrics?.height || 0}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between mt-1">
                  <span>{currentMetrics?.megapixels || 0} MP</span>
                  {beforeMetrics && (
                    <span className="text-emerald-400 font-semibold">
                      {calculateGain(beforeMetrics.megapixels, currentMetrics?.megapixels)}
                    </span>
                  )}
                </div>
              </div>

              {/* Netteté Laplacien */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Piqué / Netteté (Laplacien)
                </span>
                <div className="text-sm font-bold text-white font-mono">
                  {currentMetrics?.laplacianVariance || 0}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between mt-1">
                  <span>Index de clarté</span>
                  {beforeMetrics && (
                    <span className="text-emerald-400 font-semibold">
                      {calculateGain(beforeMetrics.laplacianVariance, currentMetrics?.laplacianVariance)}
                    </span>
                  )}
                </div>
              </div>

              {/* SNR dB */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Signal / Bruit (SNR)
                </span>
                <div className="text-sm font-bold text-white font-mono">
                  {currentMetrics?.snrDb || 0} dB
                </div>
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between mt-1">
                  <span>Propreté capteur</span>
                  {beforeMetrics && (
                    <span className="text-emerald-400 font-semibold">
                      {calculateGain(beforeMetrics.snrDb, currentMetrics?.snrDb)}
                    </span>
                  )}
                </div>
              </div>

              {/* Plage Dynamique */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Plage Dynamique
                </span>
                <div className="text-sm font-bold text-white font-mono">
                  {currentMetrics?.dynamicRange || 0} / 255
                </div>
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between mt-1">
                  <span>Luminance moy. {currentMetrics?.meanBrightness}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Histogramme en direct */}
          {currentMetrics?.histogram && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-medium font-mono">
                <span>Histogramme Spectrométrique</span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span> Lum
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> R
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> G
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> B
                  </span>
                </div>
              </div>

              {/* SVG Histogram Graph */}
              <div className="h-20 w-full bg-zinc-950 rounded-lg p-1 relative overflow-hidden flex items-end">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 32 100">
                  {/* Luminance Area */}
                  <polygon
                    points={`0,100 ${currentMetrics.histogram.luminance.map((v, i) => `${i},${100 - v * 95}`).join(' ')} 32,100`}
                    fill="rgba(255, 255, 255, 0.15)"
                  />
                  {/* Red Channel Line */}
                  <polyline
                    points={currentMetrics.histogram.r.map((v, i) => `${i},${100 - v * 95}`).join(' ')}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                  />
                  {/* Green Channel Line */}
                  <polyline
                    points={currentMetrics.histogram.g.map((v, i) => `${i},${100 - v * 95}`).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  {/* Blue Channel Line */}
                  <polyline
                    points={currentMetrics.histogram.b.map((v, i) => `${i},${100 - v * 95}`).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Rapport Technique d'Exécution Détaillé */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Rapport de Traitement
              </span>
              {result && (
                <span className="text-[10px] font-mono text-zinc-400">
                  {result.algorithm}
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-1.5 text-xs text-zinc-300">
                {result.reportSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-indigo-400 font-mono text-[11px] font-bold">
                      0{idx + 1}.
                    </span>
                    <span className="text-[11px] text-zinc-300">{step}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Sélectionnez une commande dans le panneau gauche pour lancer le moteur et générer le rapport.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2 : Sandbox Python & Script OpenCV */}
      {activeTab === 'python' && (
        <div className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 font-medium">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Script Python OpenCV Exécutable</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 transition-colors cursor-pointer"
              title="Copier le script Python"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>

          {/* Éditeur de code interactif */}
          <div className="flex-1 relative rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 flex flex-col font-mono text-xs">
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="# Code Python OpenCV / Pillow..."
              className="flex-1 w-full bg-zinc-950 p-3 text-zinc-200 resize-none focus:outline-none text-[11px] leading-relaxed selection:bg-indigo-900"
              spellCheck={false}
            />

            <div className="h-9 bg-zinc-900 border-t border-zinc-800 px-3 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                Variables disponibles : INPUT_PATH, OUTPUT_PATH
              </span>

              <button
                onClick={() => onExecuteCustomPython(customCode)}
                disabled={isExecutingPython || !customCode}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isExecutingPython ? 'Calcul...' : 'Exécuter'}</span>
              </button>
            </div>
          </div>

          {/* Console stdout / Logs */}
          <div className="h-32 bg-zinc-900 rounded-xl border border-zinc-800 p-2.5 font-mono text-[10px] text-zinc-300 overflow-y-auto space-y-1">
            <div className="text-zinc-500 border-b border-zinc-800/80 pb-1 flex items-center justify-between">
              <span>Sortie Terminal Sandbox</span>
              <span className="text-[9px] text-emerald-400">Python 3.10 · Sandbox OK</span>
            </div>
            <pre className="text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
              {pythonTerminalOutput || result?.stdout || '[INFO] Moteur OpenCV 4.6 initialisé et prêt.'}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3 : Expertise IA */}
      {activeTab === 'ai' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white tracking-tight">
                Analyse & Diagnostic Expert Vision
              </h4>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              L'IA examine la répartition spectrale, le bruit de capteur et propose un plan d'optimisation photographique sur-mesure.
            </p>

            <button
              onClick={onRequestGeminiAppraisal}
              disabled={isAppraising}
              className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAppraising ? 'Analyse en cours...' : 'Demander l\'Avis d\'Expert'}</span>
            </button>
          </div>

          {geminiAppraisal && (
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Rapport de Diagnostic Photographique :
              </div>
              <div>{geminiAppraisal}</div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

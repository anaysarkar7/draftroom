'use client';

import { useMemo } from 'react';
import { X, Clock, FileText, Users, MessageSquare, Clapperboard } from 'lucide-react';
import { analyzeScript } from '@/lib/script-analysis';
import type { Script } from '@/types/screenplay';
import { cn } from '@/lib/utils';

interface ScriptAnalysisModalProps {
  script: Script;
  pageCount: number;
  onClose: () => void;
}

export function ScriptAnalysisModal({ script, pageCount, onClose }: ScriptAnalysisModalProps) {
  const analysis = useMemo(() => analyzeScript(script.content), [script.content]);

  const maxLines = Math.max(...analysis.characters.map((c) => c.dialogueLines), 1);

  const fmtTime = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">Script Analysis</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{script.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* Overview stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-gray-800">
            <Stat icon={<FileText size={13} />} label="Pages" value={String(pageCount)} />
            <Stat icon={<Clapperboard size={13} />} label="Scenes" value={String(analysis.sceneCount)} />
            <Stat
              icon={<MessageSquare size={13} />}
              label="Words"
              value={analysis.totalWords.toLocaleString()}
            />
            <Stat
              icon={<Clock size={13} />}
              label="Est. Run Time"
              value={fmtTime(analysis.estimatedRunTime)}
              sub="≈1 min/page rule"
              highlight
            />
          </div>

          {/* Word breakdown */}
          <div className="px-5 py-4 border-b border-gray-800">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Word Breakdown
            </p>
            <div className="flex gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500/60" />
                Dialogue: {analysis.dialogueWords.toLocaleString()} words
                {analysis.totalWords > 0 && (
                  <span className="text-gray-600">
                    ({Math.round((analysis.dialogueWords / analysis.totalWords) * 100)}%)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-500/60" />
                Action: {analysis.actionWords.toLocaleString()} words
              </div>
            </div>
          </div>

          {/* Character arc */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} className="text-gray-500" />
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Characters ({analysis.characters.length})
              </p>
            </div>

            {analysis.characters.length === 0 ? (
              <p className="text-xs text-gray-600 italic">
                No dialogue found. Start writing to see character stats.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.characters.map((char, i) => (
                  <div key={char.name}>
                    {/* Character name + stats */}
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-blue-400 truncate max-w-[180px]">
                        {char.name}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 shrink-0 ml-2">
                        <span>{char.dialogueLines} lines</span>
                        <span>{char.totalWords.toLocaleString()} words</span>
                        <span className="text-amber-500/80 font-medium">
                          ~{fmtTime(char.estimatedMinutes)}
                        </span>
                        <span>{char.scenesAppeared} scenes</span>
                      </div>
                    </div>
                    {/* Dialogue line bar */}
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          i === 0
                            ? 'bg-blue-500'
                            : i === 1
                            ? 'bg-blue-400/70'
                            : i === 2
                            ? 'bg-blue-400/50'
                            : 'bg-gray-600'
                        )}
                        style={{ width: `${(char.dialogueLines / maxLines) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-gray-800 shrink-0">
          <p className="text-[10px] text-gray-600">
            Speaking time estimated at 125 wpm · Overall run time at 150 wpm · Standard: 1 page ≈ 1 min
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-gray-800/60 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn('text-base font-bold', highlight ? 'text-amber-400' : 'text-white')}>
        {value}
      </p>
      {sub && <p className="text-[9px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

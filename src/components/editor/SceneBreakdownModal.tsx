'use client';

import { useState } from 'react';
import { X, MapPin, Clock, Users, Tag, FileText } from 'lucide-react';
import type { NavScene, SceneBreakdownData } from '@/types/screenplay';

interface SceneBreakdownModalProps {
  scene: NavScene;
  breakdownData: SceneBreakdownData | undefined;
  onSave: (data: SceneBreakdownData) => void;
  onClose: () => void;
}

export function SceneBreakdownModal({
  scene,
  breakdownData,
  onSave,
  onClose,
}: SceneBreakdownModalProps) {
  const [props, setProps] = useState(breakdownData?.props ?? '');
  const [notes, setNotes] = useState(breakdownData?.notes ?? '');

  const handleSave = () => {
    onSave({ props, notes });
    onClose();
  };

  const propList = props
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold text-amber-500/80 uppercase tracking-wider">
                Scene {scene.index + 1}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-white truncate max-w-xs" title={scene.text}>
              {scene.text}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800 ml-3 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Auto-parsed heading metadata */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Heading Details
            </p>
            <div className="grid grid-cols-3 gap-2">
              <MetaChip
                label="INT / EXT"
                value={scene.intExt || '—'}
                color="amber"
              />
              <MetaChip
                icon={<MapPin size={11} />}
                label="Location"
                value={scene.location || '—'}
                color="blue"
                wide
              />
              <MetaChip
                icon={<Clock size={11} />}
                label="Time of Day"
                value={scene.timeOfDay || '—'}
                color="violet"
              />
            </div>
          </div>

          {/* Auto-detected cast */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={12} className="text-gray-500" />
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Cast ({scene.cast.length})
              </p>
            </div>
            {scene.cast.length === 0 ? (
              <p className="text-xs text-gray-600 italic">No dialogue detected in this scene.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {scene.cast.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-900/40 text-blue-300 border border-blue-800/50"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Props */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={12} className="text-gray-500" />
              <label
                htmlFor="props-input"
                className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Props
              </label>
            </div>
            <input
              id="props-input"
              type="text"
              value={props}
              onChange={(e) => setProps(e.target.value)}
              placeholder="e.g. gun, coffee cup, briefcase"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-colors"
            />
            {propList.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {propList.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-700/60 text-gray-300 border border-gray-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText size={12} className="text-gray-500" />
              <label
                htmlFor="notes-input"
                className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Production Notes
              </label>
            </div>
            <textarea
              id="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Director's notes, mood, special equipment…"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Save Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaChip({
  icon,
  label,
  value,
  color,
  wide,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  color: 'amber' | 'blue' | 'violet';
  wide?: boolean;
}) {
  const colors = {
    amber: 'bg-amber-900/30 border-amber-800/40 text-amber-300',
    blue: 'bg-blue-900/30 border-blue-800/40 text-blue-300',
    violet: 'bg-violet-900/30 border-violet-800/40 text-violet-300',
  };
  return (
    <div
      className={`rounded-lg border px-2.5 py-2 ${colors[color]} ${wide ? 'col-span-1' : ''}`}
    >
      <div className="flex items-center gap-1 mb-0.5 opacity-60">
        {icon}
        <span className="text-[9px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-xs font-medium truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

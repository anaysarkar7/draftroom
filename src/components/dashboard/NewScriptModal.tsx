'use client';

import { useState } from 'react';
import { X, Film, Tv, Theater, Mic } from 'lucide-react';
import type { ScriptFormat } from '@/types/screenplay';
import { FORMAT_LABELS } from '@/types/screenplay';
import { cn } from '@/lib/utils';

const FORMAT_OPTIONS: { value: ScriptFormat; icon: React.ReactNode; desc: string }[] = [
  { value: 'screenplay', icon: <Film size={18} />, desc: 'Feature film or short film' },
  { value: 'teleplay', icon: <Tv size={18} />, desc: 'TV series or episode' },
  { value: 'stage_play', icon: <Theater size={18} />, desc: 'Theater or stage production' },
  { value: 'audio_drama', icon: <Mic size={18} />, desc: 'Podcast or radio drama' },
];

interface NewScriptModalProps {
  onClose: () => void;
  onCreate: (title: string, format: ScriptFormat, author: string) => void;
}

export function NewScriptModal({ onClose, onCreate }: NewScriptModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [format, setFormat] = useState<ScriptFormat>('screenplay');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(title, format, author);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">New Script</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Script Title
            </label>
            <input
              autoFocus
              type="text"
              placeholder="My Screenplay"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Author <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={cn(
                    'flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all',
                    format === opt.value
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  )}
                >
                  <span className="mt-0.5 shrink-0">{opt.icon}</span>
                  <div>
                    <div className="text-xs font-medium">{FORMAT_LABELS[opt.value]}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Create Script
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

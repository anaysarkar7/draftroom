'use client';

/**
 * AddCommentPopover
 * ─────────────────
 * A small floating popover that appears near a text selection so the user
 * can type a note and choose a highlight colour.  The popover is positioned
 * using the browser Selection API so it stays close to the highlighted text.
 *
 * It is rendered in a React portal so z-index layering is straightforward.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquarePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green',  value: '#bbf7d0' },
  { label: 'Blue',   value: '#bfdbfe' },
  { label: 'Pink',   value: '#fbcfe8' },
  { label: 'Purple', value: '#e9d5ff' },
  { label: 'Orange', value: '#fed7aa' },
];

interface Props {
  position: { top: number; left: number } | null;
  onSubmit: (text: string, color: string) => void;
  onClose: () => void;
}

export function AddCommentPopover({ position, onSubmit, onClose }: Props) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#fef08a');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when the popover opens
  useEffect(() => {
    if (position) {
      setText('');
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [position]);

  if (!position || typeof document === 'undefined') return null;

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim(), color);
    setText('');
  };

  return createPortal(
    <>
      {/* Backdrop to close on outside click */}
      <div className="fixed inset-0 z-[100]" onMouseDown={onClose} />

      <div
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 101,
        }}
        className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-72 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
            <MessageSquarePlus size={13} className="text-yellow-400" />
            Add Note
          </span>
          <button onMouseDown={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={13} />
          </button>
        </div>

        {/* Note textarea */}
        <div className="px-3 pt-2 pb-1">
          <textarea
            ref={textareaRef}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a note or comment…"
            className="w-full bg-gray-700 text-gray-200 text-xs rounded-lg px-2.5 py-2 resize-none outline-none border border-gray-600 focus:border-blue-500 placeholder-gray-500 leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
              if (e.key === 'Escape') onClose();
            }}
          />
        </div>

        {/* Colour picker */}
        <div className="px-3 pb-2">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1.5">Highlight colour</p>
          <div className="flex gap-1.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                onMouseDown={(e) => { e.preventDefault(); setColor(c.value); }}
                title={c.label}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                  color === c.value ? 'border-white scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pb-3 flex gap-2">
          <button
            onMouseDown={(e) => { e.preventDefault(); handleSubmit(); }}
            disabled={!text.trim()}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 text-xs font-semibold rounded-lg py-1.5 transition-colors"
          >
            Save Note
          </button>
          <button
            onMouseDown={onClose}
            className="px-3 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="px-3 pb-2">
          <p className="text-[9px] text-gray-600">⌘↵ to save · Esc to cancel</p>
        </div>
      </div>
    </>,
    document.body
  );
}

'use client';

/**
 * FormattingToolbar
 * ─────────────────
 * A slim secondary toolbar rendered directly below the main nav bar.
 * Provides MS-Word-style inline text formatting:
 *   Bold · Italic · Underline · Strikethrough
 *   Text colour · Highlight colour · Clear formatting
 *
 * Works on any text selection in the Tiptap editor.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Palette,
  RemoveFormatting,
  ChevronDown,
  MessageSquarePlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Preset colour palettes ──────────────────────────────────────────────────

const TEXT_COLORS = [
  { label: 'Default',   value: 'inherit', bg: '#111827' },
  { label: 'Red',       value: '#dc2626', bg: '#dc2626' },
  { label: 'Orange',    value: '#ea580c', bg: '#ea580c' },
  { label: 'Amber',     value: '#d97706', bg: '#d97706' },
  { label: 'Green',     value: '#16a34a', bg: '#16a34a' },
  { label: 'Teal',      value: '#0d9488', bg: '#0d9488' },
  { label: 'Blue',      value: '#2563eb', bg: '#2563eb' },
  { label: 'Indigo',    value: '#4f46e5', bg: '#4f46e5' },
  { label: 'Purple',    value: '#9333ea', bg: '#9333ea' },
  { label: 'Pink',      value: '#db2777', bg: '#db2777' },
  { label: 'Gray',      value: '#6b7280', bg: '#6b7280' },
  { label: 'White',     value: '#f9fafb', bg: '#f9fafb' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None',        value: null,      bg: 'transparent', border: '#4b5563' },
  { label: 'Yellow',      value: '#fef08a', bg: '#fef08a' },
  { label: 'Green',       value: '#bbf7d0', bg: '#bbf7d0' },
  { label: 'Blue',        value: '#bfdbfe', bg: '#bfdbfe' },
  { label: 'Pink',        value: '#fbcfe8', bg: '#fbcfe8' },
  { label: 'Purple',      value: '#e9d5ff', bg: '#e9d5ff' },
  { label: 'Orange',      value: '#fed7aa', bg: '#fed7aa' },
  { label: 'Red',         value: '#fecaca', bg: '#fecaca' },
  { label: 'Teal',        value: '#99f6e4', bg: '#99f6e4' },
];

interface FormattingToolbarProps {
  editor: Editor | null;
  onAddComment?: () => void;
  showCommentBtn?: boolean;
}

export function FormattingToolbar({ editor, onAddComment, showCommentBtn = true }: FormattingToolbarProps) {
  const [isBold, setIsBold]           = useState(false);
  const [isItalic, setIsItalic]       = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike]       = useState(false);
  const [activeColor, setActiveColor] = useState<string>('inherit');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  const [colorMenuOpen, setColorMenuOpen]     = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);

  // Sync active marks from editor selection
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      setIsBold(editor.isActive('bold'));
      setIsItalic(editor.isActive('italic'));
      setIsUnderline(editor.isActive('underline'));
      setIsStrike(editor.isActive('strike'));
      const colorAttr = editor.getAttributes('textStyle').color;
      setActiveColor(colorAttr ?? 'inherit');
      const hlAttr = editor.getAttributes('highlight').color;
      setActiveHighlight(hlAttr ?? null);
    };
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    update();
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  const fmtBtn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded transition-colors text-gray-400',
        active
          ? 'bg-gray-600 text-white'
          : 'hover:bg-gray-700 hover:text-gray-200'
      )}
    >
      {children}
    </button>
  );

  const applyColor = useCallback((value: string) => {
    if (!editor) return;
    if (value === 'inherit') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(value).run();
    }
    setColorMenuOpen(false);
  }, [editor]);

  const applyHighlight = useCallback((value: string | null) => {
    if (!editor) return;
    if (!value) {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color: value }).run();
    }
    setHighlightMenuOpen(false);
  }, [editor]);

  return (
    <div className="h-9 bg-gray-900 border-b border-gray-800 flex items-center px-4 shrink-0 relative">

      {/* ── Centred button group ─────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none">
        <div className="flex items-center gap-0.5 pointer-events-auto">

      {/* ── Bold ─── */}
      {fmtBtn(isBold, () => editor?.chain().focus().toggleBold().run(), 'Bold (⌘B)', <Bold size={13} />)}

      {/* ── Italic ── */}
      {fmtBtn(isItalic, () => editor?.chain().focus().toggleItalic().run(), 'Italic (⌘I)', <Italic size={13} />)}

      {/* ── Underline ── */}
      {fmtBtn(isUnderline, () => editor?.chain().focus().toggleUnderline().run(), 'Underline (⌘U)', <Underline size={13} />)}

      {/* ── Strikethrough ── */}
      {fmtBtn(isStrike, () => editor?.chain().focus().toggleStrike().run(), 'Strikethrough', <Strikethrough size={13} />)}

      <div className="w-px h-4 bg-gray-700 mx-1.5" />

      {/* ── Text Colour ── */}
      <div className="relative">
        <button
          onMouseDown={(e) => { e.preventDefault(); setColorMenuOpen((o) => !o); setHighlightMenuOpen(false); }}
          title="Text colour"
          className="flex items-center gap-0.5 px-1.5 h-7 rounded hover:bg-gray-700 transition-colors"
        >
          <Palette size={13} className="text-gray-400" />
          {/* Active colour swatch */}
          <span
            className="w-3 h-1.5 rounded-sm mt-0.5"
            style={{ backgroundColor: activeColor === 'inherit' ? '#6b7280' : activeColor }}
          />
          <ChevronDown size={10} className="text-gray-600" />
        </button>

        {colorMenuOpen && (
          <>
            <div className="fixed inset-0 z-30" onMouseDown={() => setColorMenuOpen(false)} />
            <div className="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-40 p-2 w-48">
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Text Colour</p>
              <div className="grid grid-cols-6 gap-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onMouseDown={(e) => { e.preventDefault(); applyColor(c.value); }}
                    title={c.label}
                    className={cn(
                      'w-6 h-6 rounded border-2 transition-transform hover:scale-110',
                      activeColor === c.value ? 'border-blue-400' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c.value === 'inherit' ? '#374151' : c.bg }}
                  />
                ))}
              </div>
              {/* Custom colour input */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] text-gray-500">Custom:</span>
                <input
                  type="color"
                  defaultValue="#000000"
                  onChange={(e) => applyColor(e.target.value)}
                  className="w-6 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Highlight / Background ── */}
      <div className="relative">
        <button
          onMouseDown={(e) => { e.preventDefault(); setHighlightMenuOpen((o) => !o); setColorMenuOpen(false); }}
          title="Highlight colour"
          className="flex items-center gap-0.5 px-1.5 h-7 rounded hover:bg-gray-700 transition-colors"
        >
          <Highlighter size={13} className="text-gray-400" />
          <span
            className="w-3 h-1.5 rounded-sm mt-0.5"
            style={{
              backgroundColor: activeHighlight ?? '#4b5563',
              border: activeHighlight ? 'none' : '1px solid #6b7280',
            }}
          />
          <ChevronDown size={10} className="text-gray-600" />
        </button>

        {highlightMenuOpen && (
          <>
            <div className="fixed inset-0 z-30" onMouseDown={() => setHighlightMenuOpen(false)} />
            <div className="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-40 p-2 w-44">
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Highlight</p>
              <div className="grid grid-cols-5 gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.label}
                    onMouseDown={(e) => { e.preventDefault(); applyHighlight(c.value); }}
                    title={c.label}
                    className={cn(
                      'w-6 h-6 rounded border-2 transition-transform hover:scale-110',
                      activeHighlight === c.value ? 'border-blue-400' : 'border-gray-600'
                    )}
                    style={{ backgroundColor: c.bg }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-px h-4 bg-gray-700 mx-1.5" />

      {/* ── Clear Formatting ── */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          editor?.chain().focus().unsetAllMarks().run();
        }}
        title="Clear formatting"
        className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
      >
        <RemoveFormatting size={13} />
      </button>

      <div className="w-px h-4 bg-gray-700 mx-1.5" />

      {/* ── Add Inline Note ── */}
      {showCommentBtn && (
        <>
          <div className="w-px h-4 bg-gray-700 mx-1.5" />
          <button
            onMouseDown={(e) => { e.preventDefault(); onAddComment?.(); }}
            title="Add inline note / comment (select text first)"
            className="flex items-center gap-1.5 h-7 px-2 rounded hover:bg-yellow-900/40 text-gray-400 hover:text-yellow-300 transition-colors text-xs"
          >
            <MessageSquarePlus size={13} />
            <span className="hidden sm:inline text-[11px]">Add Note</span>
          </button>
        </>
      )}

        </div>{/* end pointer-events-auto */}
      </div>{/* end centred group */}

      {/* Hint — pinned right edge, outside the centred block */}
      <span className="ml-auto text-[10px] text-gray-700 hidden lg:block">
        Select text to format · ⌘B Bold · ⌘I Italic · ⌘U Underline
      </span>
    </div>
  );
}

'use client';

/**
 * FindReplacePanel
 * ────────────────
 * A VS-Code-style floating panel for Find & Replace in the screenplay editor.
 *
 * Features:
 *  • Case-sensitive toggle
 *  • Whole-word toggle
 *  • Element-type filter (Any | Scene Heading | Action | Character | Dialogue …)
 *  • Match counter (n / total)
 *  • Prev / Next navigation (scrolls + selects the match in the editor)
 *  • Replace current match
 *  • Replace All (applies a single transaction in reverse order)
 *  • CHARACTER RENAME shortcut — pre-selects "Character" filter
 *
 * Keyboard shortcuts (when panel is open):
 *  Enter / ⌘G   → Next match
 *  ⇧Enter / ⌘⇧G → Prev match
 *  Escape        → Close
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  ChevronUp,
  ChevronDown,
  CaseSensitive,
  WholeWord,
  Replace,
  ReplaceAll,
  Search,
  UserPen,
} from 'lucide-react';
import type { Editor } from '@tiptap/core';
import type { ElementType } from '@/types/screenplay';
import { ELEMENT_LABELS } from '@/types/screenplay';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Match {
  from: number;
  to: number;
}

interface FindOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  filterElementType: ElementType | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEARCHABLE_ELEMENT_TYPES: ElementType[] = [
  'scene_heading',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
  'shot',
  'act_break',
];

/**
 * Walk the ProseMirror document and collect all text ranges that match
 * the query, optionally filtered to a specific screenplay element type.
 */
function collectMatches(
  editor: Editor,
  query: string,
  opts: FindOptions
): Match[] {
  if (!query) return [];

  const { doc } = editor.state;
  const matches: Match[] = [];
  const needle = opts.caseSensitive ? query : query.toLowerCase();

  // Track which screenplayElement we're currently inside
  let currentElementType: string | null = null;

  doc.descendants((node, pos) => {
    if (node.type.name === 'screenplayElement') {
      currentElementType = node.attrs.elementType as string;
      return true; // recurse into children
    }

    if (node.isText && node.text) {
      // Apply element-type filter
      if (opts.filterElementType && currentElementType !== opts.filterElementType) {
        return false;
      }

      const hay = opts.caseSensitive ? node.text : node.text.toLowerCase();
      let idx = 0;

      while (idx < hay.length) {
        const found = hay.indexOf(needle, idx);
        if (found === -1) break;

        // Whole-word check
        if (opts.wholeWord) {
          const before = found > 0 ? hay[found - 1] : ' ';
          const after = found + needle.length < hay.length ? hay[found + needle.length] : ' ';
          const wordChar = /\w/;
          if (wordChar.test(before) || wordChar.test(after)) {
            idx = found + 1;
            continue;
          }
        }

        matches.push({ from: pos + found, to: pos + found + query.length });
        idx = found + query.length; // advance past this match (no overlapping)
      }
    }
    return true;
  });

  return matches;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FindReplacePanelProps {
  editor: Editor | null;
  initialMode?: 'find' | 'replace';
  initialElementType?: ElementType | null;
  onClose: () => void;
}

export function FindReplacePanel({
  editor,
  initialMode = 'find',
  initialElementType = null,
  onClose,
}: FindReplacePanelProps) {
  const [mode, setMode] = useState<'find' | 'replace'>(initialMode);
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [filterElementType, setFilterElementType] = useState<ElementType | null>(initialElementType);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [replaceStatus, setReplaceStatus] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

  // ── Recalculate matches whenever query / options change ───────────────────
  useEffect(() => {
    if (!editor || !query) {
      setMatches([]);
      setCurrentIdx(0);
      return;
    }
    const found = collectMatches(editor, query, { caseSensitive, wholeWord, filterElementType });
    setMatches(found);
    setCurrentIdx(0);
  }, [editor, query, caseSensitive, wholeWord, filterElementType]);

  // ── Navigate to match ─────────────────────────────────────────────────────
  const goTo = useCallback(
    (idx: number) => {
      if (!editor || matches.length === 0) return;
      const clamped = (idx + matches.length) % matches.length;
      setCurrentIdx(clamped);
      const m = matches[clamped];
      editor.chain().setTextSelection({ from: m.from, to: m.to }).scrollIntoView().run();
      editor.view.focus();
    },
    [editor, matches]
  );

  const goNext = useCallback(() => goTo(currentIdx + 1), [goTo, currentIdx]);
  const goPrev = useCallback(() => goTo(currentIdx - 1), [goTo, currentIdx]);

  // ── Replace current ───────────────────────────────────────────────────────
  const replaceCurrent = useCallback(() => {
    if (!editor || matches.length === 0) return;
    const m = matches[currentIdx];
    editor.chain().setTextSelection({ from: m.from, to: m.to }).insertContent(replacement).run();
    // Refresh matches after the document mutated
    const fresh = collectMatches(editor, query, { caseSensitive, wholeWord, filterElementType });
    setMatches(fresh);
    const next = Math.min(currentIdx, fresh.length - 1);
    setCurrentIdx(next);
    if (fresh[next]) {
      editor.chain().setTextSelection({ from: fresh[next].from, to: fresh[next].to }).scrollIntoView().run();
    }
    setReplaceStatus(`Replaced 1`);
    setTimeout(() => setReplaceStatus(''), 1800);
  }, [editor, matches, currentIdx, replacement, query, caseSensitive, wholeWord, filterElementType]);

  // ── Replace all ───────────────────────────────────────────────────────────
  const replaceAll = useCallback(() => {
    if (!editor || matches.length === 0) return;
    const count = matches.length;
    const tr = editor.state.tr;
    // Apply in REVERSE order so earlier positions stay valid
    [...matches].reverse().forEach((m) => {
      tr.insertText(replacement, m.from, m.to);
    });
    editor.view.dispatch(tr);
    setMatches([]);
    setCurrentIdx(0);
    setReplaceStatus(`Replaced ${count}`);
    setTimeout(() => setReplaceStatus(''), 2500);
  }, [editor, matches, replacement]);

  // ── Keyboard handling ─────────────────────────────────────────────────────
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter') { e.shiftKey ? goPrev() : goNext(); return; }
    if (e.key === 'Tab' && mode === 'replace') { e.preventDefault(); replaceRef.current?.focus(); }
  };

  const handleReplaceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey) { replaceAll(); } else { replaceCurrent(); }
    }
  };

  // Auto-focus search input when panel opens
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  // ── Option button helper ──────────────────────────────────────────────────
  const optBtn = (
    active: boolean,
    onClick: () => void,
    title: string,
    icon: React.ReactNode
  ) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'flex items-center justify-center w-6 h-6 rounded transition-colors text-xs',
        active
          ? 'bg-blue-600/80 text-white'
          : 'text-gray-500 hover:bg-gray-700 hover:text-gray-300'
      )}
    >
      {icon}
    </button>
  );

  const matchLabel =
    matches.length === 0
      ? query ? 'No matches' : ''
      : `${currentIdx + 1} / ${matches.length}`;

  return (
    <div
      className="fixed top-[90px] right-6 z-50 w-[420px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {/* ── Header tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-gray-800 px-3 pt-2">
        <button
          onClick={() => setMode('find')}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-t transition-colors',
            mode === 'find'
              ? 'bg-gray-800 text-gray-200 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <Search size={11} /> Find
        </button>
        <button
          onClick={() => { setMode('replace'); setTimeout(() => replaceRef.current?.focus(), 30); }}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-t transition-colors',
            mode === 'replace'
              ? 'bg-gray-800 text-gray-200 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <Replace size={11} /> Replace
        </button>
        {/* Character rename shortcut */}
        <button
          onClick={() => {
            setMode('replace');
            setFilterElementType('character');
            setTimeout(() => searchRef.current?.focus(), 30);
          }}
          title="Character Rename — searches only in Character name elements"
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-t transition-colors ml-1',
            filterElementType === 'character' && mode === 'replace'
              ? 'bg-purple-900/60 text-purple-300 border-b-2 border-purple-500'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <UserPen size={11} /> Rename
        </button>

        <div className="flex-1" />
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-700 text-gray-500 hover:text-gray-300 mb-1"
        >
          <X size={13} />
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="p-3 space-y-2">

        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search…"
              spellCheck={false}
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none placeholder-gray-600 pr-20"
            />
            {/* Match counter */}
            <span className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono pointer-events-none',
              query && matches.length === 0 ? 'text-red-400' : 'text-gray-500'
            )}>
              {matchLabel}
            </span>
          </div>

          {/* Prev / Next */}
          <button
            onClick={goPrev}
            disabled={matches.length === 0}
            title="Previous match (⇧Enter)"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 disabled:opacity-30 transition-colors"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={goNext}
            disabled={matches.length === 0}
            title="Next match (Enter)"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 disabled:opacity-30 transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Replace row (only in replace mode) */}
        {mode === 'replace' && (
          <div className="flex items-center gap-2">
            <input
              ref={replaceRef}
              type="text"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              onKeyDown={handleReplaceKeyDown}
              placeholder="Replace with…"
              spellCheck={false}
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-green-500 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none placeholder-gray-600"
            />
            <button
              onClick={replaceCurrent}
              disabled={matches.length === 0}
              title="Replace current (Enter)"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-30 transition-colors shrink-0"
            >
              <Replace size={11} /> Replace
            </button>
            <button
              onClick={replaceAll}
              disabled={matches.length === 0}
              title="Replace all (⌘Enter)"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-30 transition-colors shrink-0"
            >
              <ReplaceAll size={11} /> All
            </button>
          </div>
        )}

        {/* Options row */}
        <div className="flex items-center gap-2 pt-0.5">
          {optBtn(caseSensitive, () => setCaseSensitive((v) => !v), 'Case sensitive (Aa)', <CaseSensitive size={12} />)}
          {optBtn(wholeWord, () => setWholeWord((v) => !v), 'Whole word (\\b)', <WholeWord size={12} />)}

          <div className="w-px h-4 bg-gray-700 mx-1" />

          {/* Element type filter */}
          <span className="text-[10px] text-gray-600 shrink-0">In:</span>
          <select
            value={filterElementType ?? ''}
            onChange={(e) => setFilterElementType((e.target.value as ElementType) || null)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-[11px] text-gray-300 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Any element</option>
            {SEARCHABLE_ELEMENT_TYPES.map((t) => (
              <option key={t} value={t}>{ELEMENT_LABELS[t]}</option>
            ))}
          </select>

          {/* Replace status flash */}
          {replaceStatus && (
            <span className="text-[10px] text-green-400 shrink-0 font-medium">
              ✓ {replaceStatus}
            </span>
          )}
        </div>

        {/* Hint */}
        <p className="text-[9px] text-gray-700 pt-0.5">
          Enter → next · ⇧Enter → prev{mode === 'replace' ? ' · ⌘Enter → Replace All' : ''} · Esc → close
        </p>
      </div>
    </div>
  );
}

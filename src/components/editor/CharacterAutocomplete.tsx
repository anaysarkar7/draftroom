'use client';

/**
 * CharacterAutocomplete
 * ─────────────────────
 * Floating dropdown that appears whenever the cursor is inside a `character`
 * screenplay element.  It reads all unique character names already used in
 * the script and shows the ones that match what the user has typed so far.
 *
 * CONT'D intelligence
 * ───────────────────
 * When the most-recent speaker (looking backward past action / shot /
 * transition lines, but stopping at a scene_heading or another character)
 * is the same character being typed, that suggestion is surfaced first with
 * a "(CONT'D)" suffix — matching Final Draft's behaviour.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/core';
import type { Node as PmNode } from '@tiptap/pm/model';

interface Props {
  editor: Editor | null;
}

interface Suggestion {
  label: string;        // display text  e.g. "SARAH (CONT'D)"
  insertText: string;   // what to put in the node
  isContd: boolean;
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Return every unique character name in the document (no CONT'D suffix). */
function extractCharacterNames(doc: PmNode): string[] {
  const names = new Set<string>();
  doc.forEach((node) => {
    if (
      node.type.name === 'screenplayElement' &&
      node.attrs.elementType === 'character'
    ) {
      const raw = node.textContent.trim().replace(/\s*\(CONT['']D\)\s*$/i, '').trim();
      if (raw) names.add(raw.toUpperCase());
    }
  });
  return Array.from(names).sort();
}

/**
 * Walk backwards through nodes before `beforeNodeStart` and find the most
 * recent character name.  Returns empty string if interrupted by a
 * scene_heading / act_break, or if nothing found.
 */
function findLastSpeaker(doc: PmNode, beforeNodeStart: number): string {
  const nodes: { type: string; name: string }[] = [];
  doc.forEach((node, offset) => {
    if (offset >= beforeNodeStart) return;
    if (node.type.name === 'screenplayElement') {
      const raw = node.textContent
        .trim()
        .replace(/\s*\(CONT['']D\)\s*$/i, '')
        .trim()
        .toUpperCase();
      nodes.push({ type: node.attrs.elementType as string, name: raw });
    }
  });

  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (n.type === 'dialogue' || n.type === 'parenthetical') continue;
    if (n.type === 'character') return n.name;
    // scene_heading, act_break, transition, shot, action → stop
    return '';
  }
  return '';
}

// ─── component ──────────────────────────────────────────────────────────────

export function CharacterAutocomplete({ editor }: Props) {
  const [visible, setVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // track selected index in a ref so keydown handler always sees latest value
  const selectedIdxRef = useRef(0);
  selectedIdxRef.current = selectedIdx;
  const suggestionsRef = useRef<Suggestion[]>([]);
  suggestionsRef.current = suggestions;

  // Build & position the suggestion list
  const refresh = useCallback(() => {
    if (!editor) return;

    const { $from } = editor.state.selection;
    const node = $from.node();

    if (
      node?.type.name !== 'screenplayElement' ||
      node.attrs.elementType !== 'character'
    ) {
      setVisible(false);
      return;
    }

    // Current text typed by the user (no CONT'D)
    const rawText = node.textContent
      .trim()
      .replace(/\s*\(CONT['']D\)\s*$/i, '')
      .trim()
      .toUpperCase();

    const allNames = extractCharacterNames(editor.state.doc);

    // Last speaker (for CONT'D detection)
    const nodeStart = $from.before(); // absolute pos of opening tag
    const lastSpeaker = findLastSpeaker(editor.state.doc, nodeStart);

    // Build suggestions
    const seen = new Set<string>();
    const list: Suggestion[] = [];

    // 1. If there's text typed, filter by prefix
    const matching = rawText
      ? allNames.filter((n) => n.startsWith(rawText) && n !== rawText)
      : allNames;

    // Prioritise the CONT'D candidate
    if (lastSpeaker && matching.includes(lastSpeaker)) {
      seen.add(lastSpeaker);
      list.push({
        label: `${lastSpeaker} (CONT'D)`,
        insertText: `${lastSpeaker} (CONT'D)`,
        isContd: true,
      });
    }

    // Then remaining matches (alphabetical)
    for (const name of matching) {
      if (seen.has(name)) continue;
      seen.add(name);
      list.push({ label: name, insertText: name, isContd: false });
    }

    if (list.length === 0) {
      setVisible(false);
      return;
    }

    setSuggestions(list);
    setSelectedIdx(0);

    // Position below the cursor
    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    setPos({ top: coords.bottom + 6, left: coords.left });
    setVisible(true);
  }, [editor]);

  // Subscribe to editor changes
  useEffect(() => {
    if (!editor) return;
    editor.on('transaction', refresh);
    editor.on('selectionUpdate', refresh);
    return () => {
      editor.off('transaction', refresh);
      editor.off('selectionUpdate', refresh);
    };
  }, [editor, refresh]);

  // Keyboard handler — intercept BEFORE ProseMirror sees the event
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      const sug = suggestionsRef.current;
      const idx = selectedIdxRef.current;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIdx((i) => Math.min(i + 1, sug.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false);
        return;
      }
      // Tab selects the highlighted suggestion without inserting a new element
      if (e.key === 'Tab') {
        if (sug[idx]) {
          e.preventDefault();
          e.stopPropagation();
          insertSuggestion(sug[idx].insertText);
        }
        return;
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('keydown', handleKeyDown, true);
    return () => editorDom.removeEventListener('keydown', handleKeyDown, true);
  }, [editor, visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Replace the current character node content with the selected suggestion
  const insertSuggestion = useCallback(
    (text: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .command(({ tr, state }) => {
          const { $from } = state.selection;
          const node = $from.node();
          if (
            node.type.name !== 'screenplayElement' ||
            node.attrs.elementType !== 'character'
          )
            return false;
          const start = $from.start();
          const end = $from.end();
          // Clear existing content and insert the suggestion text
          tr.replaceWith(start, end, state.schema.text(text));
          return true;
        })
        .run();
      setVisible(false);
    },
    [editor]
  );

  if (!visible || suggestions.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={containerRef}
      style={{ top: pos.top, left: pos.left, position: 'fixed', zIndex: 9999 }}
      className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl py-1 min-w-[220px] max-w-[340px] overflow-hidden"
      // Prevent the editor from losing focus when clicking on suggestions
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Header hint */}
      <div className="px-3 pt-1 pb-1.5 border-b border-gray-700">
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">
          Characters
        </span>
        <span className="float-right text-[9px] text-gray-600">↑↓ navigate · Tab select · Esc dismiss</span>
      </div>

      {suggestions.map((s, i) => (
        <button
          key={s.insertText}
          onMouseDown={(e) => {
            e.preventDefault();
            insertSuggestion(s.insertText);
          }}
          className={[
            'w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors',
            i === selectedIdx
              ? 'bg-blue-600 text-white'
              : 'text-gray-200 hover:bg-gray-700',
          ].join(' ')}
        >
          <span className="font-mono text-xs uppercase tracking-wider truncate">
            {s.label}
          </span>
          {s.isContd && (
            <span
              className={[
                'shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full',
                i === selectedIdx
                  ? 'bg-blue-400/30 text-blue-100'
                  : 'bg-cyan-900 text-cyan-400',
              ].join(' ')}
            >
              CONT'D
            </span>
          )}
        </button>
      ))}
    </div>,
    document.body
  );
}

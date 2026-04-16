'use client';

/**
 * BeatBoard (Index Cards)
 * ───────────────────────
 * A full-screen corkboard-style overlay where each scene is displayed as a
 * draggable index card.  Writers can:
 *   • See all scenes at a glance
 *   • Write a one-line beat / synopsis per card
 *   • Color-code cards by act or subplot
 *   • Drag cards to reorder — the new order is applied to the Tiptap document
 *
 * Scene data is extracted live from the editor's JSON content so cards always
 * reflect the current script state.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { X, GripVertical, MapPin, Clock, Users, Lightbulb, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseSceneHeading } from '@/lib/script-analysis';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SceneGroup {
  id: string;               // heading text used as stable key
  index: number;            // 1-based scene number
  headingText: string;
  intExt: string;
  location: string;
  timeOfDay: string;
  cast: string[];           // character names found in this scene
  nodes: TNode[];           // raw Tiptap JSON nodes
}

// ─── Colour palette for card labels ──────────────────────────────────────────

const CARD_COLORS = [
  { label: 'Default', value: 'default',  bg: 'bg-gray-700',    border: 'border-gray-600', dot: '#6b7280' },
  { label: 'Yellow',  value: 'yellow',   bg: 'bg-yellow-900/40', border: 'border-yellow-700', dot: '#ca8a04' },
  { label: 'Green',   value: 'green',    bg: 'bg-green-900/40',  border: 'border-green-700',  dot: '#16a34a' },
  { label: 'Blue',    value: 'blue',     bg: 'bg-blue-900/40',   border: 'border-blue-700',   dot: '#2563eb' },
  { label: 'Purple',  value: 'purple',   bg: 'bg-purple-900/40', border: 'border-purple-700', dot: '#9333ea' },
  { label: 'Red',     value: 'red',      bg: 'bg-red-900/40',    border: 'border-red-700',    dot: '#dc2626' },
  { label: 'Orange',  value: 'orange',   bg: 'bg-orange-900/40', border: 'border-orange-700', dot: '#ea580c' },
  { label: 'Pink',    value: 'pink',     bg: 'bg-pink-900/40',   border: 'border-pink-700',   dot: '#db2777' },
];

// ─── Scene extraction helpers ─────────────────────────────────────────────────

interface TNode {
  type: string;
  attrs?: Record<string, string>;
  content?: TNode[];
  text?: string;
}

function extractText(node: TNode): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractText).join('');
  return '';
}

function extractSceneGroups(content: string): SceneGroup[] {
  let doc: { content?: TNode[] };
  try { doc = JSON.parse(content); } catch { return []; }

  const groups: SceneGroup[] = [];
  let current: SceneGroup | null = null;
  let sceneIdx = 0;
  const allNodes = doc.content ?? [];

  for (const node of allNodes) {
    if (node.type === 'screenplayElement' && node.attrs?.elementType === 'scene_heading') {
      if (current) groups.push(current);
      sceneIdx++;
      const headingText = extractText(node).trim();
      const parsed = parseSceneHeading(headingText);
      current = {
        id: `scene-${sceneIdx}-${headingText || 'untitled'}`,
        index: sceneIdx,
        headingText,
        intExt: parsed.intExt,
        location: parsed.location,
        timeOfDay: parsed.timeOfDay,
        cast: [],
        nodes: [node],
      };
    } else if (current) {
      current.nodes.push(node);
      // Collect character names
      if (
        node.type === 'screenplayElement' &&
        node.attrs?.elementType === 'character'
      ) {
        const name = extractText(node)
          .trim()
          .replace(/\s*\(CONT['']D\)\s*$/i, '')
          .toUpperCase();
        if (name && !current.cast.includes(name)) current.cast.push(name);
      }
    }
  }
  if (current) groups.push(current);
  return groups;
}

/** Rebuild the editor document from reordered scene groups + any leading nodes */
function buildDocFromGroups(
  originalContent: string,
  newGroups: SceneGroup[]
): { type: string; content: TNode[] } {
  let doc: { content?: TNode[] };
  try { doc = JSON.parse(originalContent); } catch { return { type: 'doc', content: [] }; }

  const allNodes = doc.content ?? [];
  const preamble: TNode[] = [];
  for (const n of allNodes) {
    if (n.type === 'screenplayElement' && n.attrs?.elementType === 'scene_heading') break;
    preamble.push(n);
  }

  const newContent: TNode[] = [
    ...preamble,
    ...newGroups.flatMap((g) => g.nodes as TNode[]),
  ];

  return { type: 'doc', content: newContent };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  editor: Editor | null;
  scriptContent: string;
  beatNotes: Record<string, string>;
  beatColors: Record<string, string>;
  onBeatNoteChange: (sceneKey: string, note: string) => void;
  onBeatColorChange: (sceneKey: string, color: string) => void;
  onClose: () => void;
}

export function BeatBoard({
  editor,
  scriptContent,
  beatNotes,
  beatColors,
  onBeatNoteChange,
  onBeatColorChange,
  onClose,
}: Props) {
  const [scenes, setScenes] = useState<SceneGroup[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const dragSrcIndex = useRef<number>(-1);

  // Parse scenes whenever script content changes
  useEffect(() => {
    setScenes(extractSceneGroups(scriptContent));
  }, [scriptContent]);

  // ── Drag & drop handlers ─────────────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, id: string, index: number) => {
    setDraggingId(id);
    dragSrcIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggingId) setDragOverId(id);
  };

  const onDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggingId || draggingId === targetId) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }

      setScenes((prev) => {
        const next = [...prev];
        const srcIdx = next.findIndex((s) => s.id === draggingId);
        const dstIdx = next.findIndex((s) => s.id === targetId);
        if (srcIdx < 0 || dstIdx < 0) return prev;
        const [item] = next.splice(srcIdx, 1);
        next.splice(dstIdx, 0, item);

        // Reorder in editor
        if (editor) {
          const newDoc = buildDocFromGroups(scriptContent, next);
          editor.commands.setContent(newDoc as Parameters<typeof editor.commands.setContent>[0]);
        }

        return next;
      });

      setDraggingId(null);
      setDragOverId(null);
    },
    [draggingId, editor, scriptContent]
  );

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const filtered = filter.trim()
    ? scenes.filter(
        (s) =>
          s.headingText.toLowerCase().includes(filter.toLowerCase()) ||
          s.cast.some((c) => c.toLowerCase().includes(filter.toLowerCase())) ||
          (beatNotes[s.id] ?? '').toLowerCase().includes(filter.toLowerCase())
      )
    : scenes;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1008] overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-4 shrink-0">
        <LayoutGrid size={18} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-gray-200">Beat Board</h2>
        <span className="text-xs text-gray-500">{scenes.length} scenes</span>

        <div className="flex-1" />

        {/* Search / filter */}
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter scenes, cast…"
          className="bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-1.5 border border-gray-700 focus:border-blue-500 outline-none w-48 placeholder-gray-600"
        />

        <button
          onClick={onClose}
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Corkboard ──────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto p-6"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,200,100,0.06) 1px, transparent 0)
          `,
          backgroundSize: '32px 32px',
        }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 gap-3">
            <Lightbulb size={32} />
            <p className="text-sm">
              {scenes.length === 0
                ? 'No scenes yet. Add a Scene Heading to the script to see cards here.'
                : 'No scenes match your filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((scene) => (
              <IndexCard
                key={scene.id}
                scene={scene}
                beatNote={beatNotes[scene.id] ?? ''}
                cardColor={beatColors[scene.id] ?? 'default'}
                isDragging={draggingId === scene.id}
                isDragOver={dragOverId === scene.id}
                onBeatNoteChange={(note) => onBeatNoteChange(scene.id, note)}
                onColorChange={(color) => onBeatColorChange(scene.id, color)}
                onDragStart={(e) => onDragStart(e, scene.id, scene.index - 1)}
                onDragOver={(e) => onDragOver(e, scene.id)}
                onDrop={(e) => onDrop(e, scene.id)}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer hint ────────────────────────────────────────────────── */}
      <div className="h-8 bg-gray-900 border-t border-gray-800 flex items-center px-6 shrink-0">
        <p className="text-[10px] text-gray-600">
          Drag cards to reorder scenes · Click to edit beat note · Colour-code by act or subplot
        </p>
      </div>
    </div>
  );
}

// ─── IndexCard ────────────────────────────────────────────────────────────────

interface CardProps {
  scene: SceneGroup;
  beatNote: string;
  cardColor: string;
  isDragging: boolean;
  isDragOver: boolean;
  onBeatNoteChange: (note: string) => void;
  onColorChange: (color: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function IndexCard({
  scene,
  beatNote,
  cardColor,
  isDragging,
  isDragOver,
  onBeatNoteChange,
  onColorChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: CardProps) {
  const [editingNote, setEditingNote] = useState(false);
  const [localNote, setLocalNote] = useState(beatNote);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colorDef = CARD_COLORS.find((c) => c.value === cardColor) ?? CARD_COLORS[0];

  useEffect(() => { setLocalNote(beatNote); }, [beatNote]);

  const commitNote = () => {
    setEditingNote(false);
    onBeatNoteChange(localNote);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        'relative flex flex-col rounded-xl border shadow-md transition-all duration-150 select-none overflow-hidden',
        colorDef.bg,
        colorDef.border,
        isDragging && 'opacity-30 scale-95',
        isDragOver && 'ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent scale-105',
        'hover:shadow-xl hover:-translate-y-0.5 cursor-grab active:cursor-grabbing'
      )}
      style={{ minHeight: '200px' }}
    >
      {/* ── Card top bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        {/* Scene number */}
        <span className="text-[10px] font-bold text-gray-400 font-mono">
          #{scene.index}
        </span>

        {/* Colour dot + picker */}
        <div className="relative">
          <button
            onClick={() => setColorMenuOpen((o) => !o)}
            className="w-3.5 h-3.5 rounded-full border border-white/20 hover:scale-125 transition-transform"
            style={{ backgroundColor: colorDef.dot }}
            title="Card colour"
          />
          {colorMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setColorMenuOpen(false)} />
              <div className="absolute right-0 top-5 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 p-2 flex flex-col gap-1 w-28">
                <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Colour</p>
                <div className="grid grid-cols-4 gap-1">
                  {CARD_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => { onColorChange(c.value); setColorMenuOpen(false); }}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                        cardColor === c.value ? 'border-white' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c.dot }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Scene heading ──────────────────────────────────────────────── */}
      <div className="px-3 pb-2">
        {scene.intExt && (
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
            {scene.intExt}
          </span>
        )}
        <p className="text-[11px] font-bold text-gray-100 leading-tight mt-0.5 line-clamp-2">
          {scene.location || scene.headingText}
        </p>
      </div>

      {/* ── Beat / synopsis ───────────────────────────────────────────── */}
      <div
        className="flex-1 px-3 pb-2 cursor-text"
        onClick={() => { setEditingNote(true); setTimeout(() => textareaRef.current?.focus(), 10); }}
      >
        {editingNote ? (
          <textarea
            ref={textareaRef}
            rows={4}
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            onBlur={commitNote}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setEditingNote(false); setLocalNote(beatNote); }
              if (e.key === 'Enter' && e.metaKey) commitNote();
            }}
            placeholder="Write the beat / synopsis…"
            className="w-full bg-transparent text-[11px] text-gray-300 resize-none outline-none placeholder-gray-600 leading-relaxed"
            style={{ minHeight: '64px' }}
          />
        ) : (
          <p className={cn(
            'text-[11px] leading-relaxed',
            localNote ? 'text-gray-300' : 'text-gray-600 italic'
          )}>
            {localNote || 'Click to add beat…'}
          </p>
        )}
      </div>

      {/* ── Meta row ─────────────────────────────────────────────────── */}
      <div className="px-3 pt-1 pb-2.5 border-t border-white/5 space-y-1">
        {/* Time of day */}
        {scene.timeOfDay && (
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <Clock size={9} />
            <span className="uppercase tracking-wider">{scene.timeOfDay}</span>
          </div>
        )}

        {/* Cast */}
        {scene.cast.length > 0 && (
          <div className="flex items-start gap-1 text-[9px] text-gray-500">
            <Users size={9} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1 leading-tight">
              {scene.cast.slice(0, 4).join(', ')}
              {scene.cast.length > 4 && ` +${scene.cast.length - 4}`}
            </span>
          </div>
        )}
      </div>

      {/* ── Drag handle (decorative) ──────────────────────────────────── */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-gray-600 opacity-30 pointer-events-none">
        <GripVertical size={10} />
      </div>
    </div>
  );
}

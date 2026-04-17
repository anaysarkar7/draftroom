'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import {
  ChevronDown,
  Download,
  ArrowLeft,
  Check,
  Film,
  Tv,
  Theater,
  Mic,
  FileJson,
  FileText,
  SlidersHorizontal,
  Hash,
  Moon,
  Printer,
  BarChart2,
  Columns2,
  FileSignature,
  Clapperboard,
  LayoutGrid,
  MessageSquare,
  ListOrdered,
  Search,
} from 'lucide-react';
import type { Editor } from '@tiptap/core';
import type { ElementType, ScriptFormat, PageStyle } from '@/types/screenplay';
import { ELEMENT_LABELS, ELEMENT_SHORTCUTS, FORMAT_LABELS } from '@/types/screenplay';
import { cn } from '@/lib/utils';

const ELEMENT_TYPES: ElementType[] = [
  'scene_heading',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
  'shot',
  'act_break',
];

const ELEMENT_COLORS: Record<ElementType, string> = {
  scene_heading: 'text-amber-500',
  action: 'text-gray-300',
  character: 'text-blue-400',
  parenthetical: 'text-purple-400',
  dialogue: 'text-green-400',
  transition: 'text-red-400',
  shot: 'text-orange-400',
  act_break: 'text-cyan-400',
};

const FORMAT_ICONS: Record<ScriptFormat, React.ReactNode> = {
  screenplay: <Film size={14} />,
  teleplay: <Tv size={14} />,
  stage_play: <Theater size={14} />,
  audio_drama: <Mic size={14} />,
};

const PAGE_STYLE_OPTIONS: { value: PageStyle; label: string }[] = [
  { value: 'plain',  label: 'Plain'  },
  { value: 'dotted', label: 'Dotted' },
  { value: 'lined',  label: 'Lined'  },
  { value: 'grid',   label: 'Grid'   },
];

interface EditorToolbarProps {
  editor: Editor | null;
  title: string;
  format: ScriptFormat;
  isSaved: boolean;
  onTitleChange: (title: string) => void;
  onExportJson: () => void;
  onExportTxt: () => void;
  onExportPdf: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
  pageStyle: PageStyle;
  onPageStyleChange: (style: PageStyle) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAnalysis: () => void;
  showTitlePage: boolean;
  onToggleTitlePage: () => void;
  showComments: boolean;
  onToggleComments: () => void;
  commentCount: number;
  onOpenBeatBoard: () => void;
  showSceneNumbers: boolean;
  onToggleSceneNumbers: () => void;
  onOpenFindReplace: (mode?: 'find' | 'replace') => void;
}

export function EditorToolbar({
  editor,
  title,
  format,
  isSaved,
  onTitleChange,
  onExportJson,
  onExportTxt,
  onExportPdf,
  showLineNumbers,
  onToggleLineNumbers,
  pageStyle,
  onPageStyleChange,
  darkMode,
  onToggleDarkMode,
  onOpenAnalysis,
  showTitlePage,
  onToggleTitlePage,
  showComments,
  onToggleComments,
  commentCount,
  onOpenBeatBoard,
  showSceneNumbers,
  onToggleSceneNumbers,
  onOpenFindReplace,
}: EditorToolbarProps) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [activeType, setActiveType] = useState<ElementType>('action');

  // Track active element type from editor selection
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { $from } = editor.state.selection;
      const node = $from.node();
      if (node?.type.name === 'screenplayElement') {
        setActiveType(node.attrs.elementType as ElementType);
      }
    };
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleTypeSelect = useCallback(
    (type: ElementType) => {
      editor?.chain().focus().setElementType(type).run();
      setTypeMenuOpen(false);
    },
    [editor]
  );

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (localTitle.trim()) onTitleChange(localTitle.trim());
  };

  const handleInsertDualDialogue = () => {
    editor?.chain().focus().insertDualDialogue().run();
  };

  return (
    <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center shrink-0 z-30 relative overflow-x-auto scrollbar-hide">
      {/* Inner scroll container — w-full lets flex-1 spacer work on desktop; min-w-max triggers scroll on mobile */}
      <div className="flex items-center px-3 sm:px-4 gap-2 sm:gap-3 min-w-max w-full h-full">

      {/* Back */}
      <Link
        href="/dashboard"
        className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
        title="Back to Dashboard"
      >
        <ArrowLeft size={16} />
      </Link>

      <div className="w-px h-5 bg-gray-800 shrink-0" />

      {/* Title */}
      {editingTitle ? (
        <input
          autoFocus
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleBlur();
            if (e.key === 'Escape') {
              setLocalTitle(title);
              setEditingTitle(false);
            }
          }}
          className="bg-gray-800 text-white text-sm font-medium px-2 py-1 rounded border border-gray-600 outline-none focus:border-blue-500 w-32 sm:w-48"
        />
      ) : (
        <button
          onClick={() => setEditingTitle(true)}
          className="text-white text-sm font-medium hover:text-gray-200 transition-colors max-w-[120px] sm:max-w-[200px] truncate shrink-0"
          title="Click to rename"
        >
          {title || 'Untitled Script'}
        </button>
      )}

      {/* Format badge — hidden on very small screens */}
      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded shrink-0">
        {FORMAT_ICONS[format]}
        {FORMAT_LABELS[format]}
      </span>

      <div className="flex-1 min-w-[8px]" />

      {/* Auto-save indicator */}
      <span
        className={cn(
          'text-xs transition-all duration-500',
          isSaved ? 'text-gray-600' : 'text-amber-500'
        )}
      >
        {isSaved ? (
          <span className="flex items-center gap-1">
            <Check size={11} /> Saved
          </span>
        ) : (
          'Saving…'
        )}
      </span>

      <div className="w-px h-5 bg-gray-800" />

      {/* Beat Board */}
      <button
        onClick={onOpenBeatBoard}
        title="Beat Board / Index Cards"
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors bg-gray-800 hover:bg-gray-700 text-amber-400/80 hover:text-amber-400"
      >
        <LayoutGrid size={13} />
        <span className="hidden sm:inline">Beat Board</span>
      </button>

      {/* Title Page toggle */}
      <button
        onClick={onToggleTitlePage}
        title={showTitlePage ? 'Hide Title Page' : 'Show Title Page'}
        className={cn(
          'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors',
          showTitlePage
            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/40 hover:bg-blue-600/30'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200'
        )}
      >
        <FileSignature size={13} />
        <span className="hidden sm:inline">Title Page</span>
      </button>

      {/* Inline Comments toggle */}
      <button
        onClick={onToggleComments}
        title={showComments ? 'Hide Notes panel' : 'Show Notes panel'}
        className={cn(
          'relative flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors',
          showComments
            ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 hover:bg-yellow-600/30'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200'
        )}
      >
        <MessageSquare size={13} />
        <span className="hidden sm:inline">Notes</span>
        {commentCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-yellow-500 text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {commentCount}
          </span>
        )}
      </button>

      {/* Script Analysis */}
      <button
        onClick={onOpenAnalysis}
        title="Script Analysis"
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200"
      >
        <BarChart2 size={13} />
        <span className="hidden sm:inline">Analysis</span>
      </button>

      {/* Dual Dialogue */}
      <button
        onClick={handleInsertDualDialogue}
        title="Insert Dual Dialogue (⌘⇧D)"
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200"
      >
        <Columns2 size={13} />
        <span className="hidden sm:inline">Dual</span>
      </button>

      <div className="w-px h-5 bg-gray-800" />

      {/* Element type picker */}
      <div className="relative">
        <button
          onClick={() => setTypeMenuOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded transition-colors"
        >
          <span className={cn('font-medium', ELEMENT_COLORS[activeType])}>
            {ELEMENT_LABELS[activeType]}
          </span>
          <ChevronDown size={12} className="text-gray-500" />
        </button>

        {typeMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setTypeMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
              {/* Core screenplay elements */}
              <div className="px-3 pt-1 pb-1">
                <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-widest">Screenplay</p>
              </div>
              {ELEMENT_TYPES.filter((t) => t !== 'act_break').map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-700 transition-colors',
                    activeType === type ? 'bg-gray-700' : ''
                  )}
                >
                  <span className={cn('font-medium', ELEMENT_COLORS[type])}>
                    {ELEMENT_LABELS[type]}
                  </span>
                  <span className="text-gray-600 font-mono">{ELEMENT_SHORTCUTS[type]}</span>
                </button>
              ))}

              {/* Act breaks — TV/Stage specific */}
              <div className="h-px bg-gray-700 mx-2 mt-1 mb-1" />
              <div className="px-3 pb-1">
                <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-widest flex items-center gap-1">
                  <Clapperboard size={9} />
                  TV / Stage
                </p>
              </div>
              <button
                onClick={() => handleTypeSelect('act_break')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-700 transition-colors',
                  activeType === 'act_break' ? 'bg-gray-700' : ''
                )}
              >
                <span className={cn('font-medium', ELEMENT_COLORS['act_break'])}>
                  {ELEMENT_LABELS['act_break']}
                </span>
                <span className="text-gray-600 font-mono">{ELEMENT_SHORTCUTS['act_break']}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── View dropdown ─────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={() => setViewMenuOpen((o) => !o)}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors',
            viewMenuOpen
              ? 'bg-gray-700 text-gray-200'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200'
          )}
          title="View settings"
        >
          <SlidersHorizontal size={12} />
          View
        </button>

        {viewMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setViewMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-2 overflow-hidden">

              {/* Display toggles */}
              <div className="px-3 pb-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Display
                </p>

                {/* Line Numbers */}
                <button
                  onClick={onToggleLineNumbers}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-700 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs text-gray-300">
                    <Hash size={12} className="text-gray-500" />
                    Line Numbers
                  </span>
                  <TogglePill on={showLineNumbers} />
                </button>

                {/* Scene Numbers */}
                <button
                  onClick={() => { onToggleSceneNumbers(); setViewMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-700 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs text-gray-300">
                    <ListOrdered size={12} className="text-gray-500" />
                    Scene Numbers
                  </span>
                  <TogglePill on={showSceneNumbers} color="green" />
                </button>

                {/* Night Writer (dark mode) */}
                <button
                  onClick={() => { onToggleDarkMode(); setViewMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-700 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs text-gray-300">
                    <Moon size={12} className="text-gray-500" />
                    Night Writer
                  </span>
                  <TogglePill on={darkMode} color="violet" />
                </button>
              </div>

              <div className="h-px bg-gray-700 mx-3 mb-2" />

              {/* Page style — hidden when dark mode is active */}
              {!darkMode && (
                <div className="px-3">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Page Style
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PAGE_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { onPageStyleChange(opt.value); setViewMenuOpen(false); }}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2 rounded border transition-all text-xs',
                          pageStyle === opt.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300'
                        )}
                      >
                        <PageStylePreview style={opt.value} />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {darkMode && (
                <div className="px-3">
                  <p className="text-[10px] text-gray-600 italic">
                    Page styles are disabled in Night Writer mode.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Find & Replace ───────────────────────────────────────── */}
      <button
        onClick={() => onOpenFindReplace('find')}
        title="Find & Replace (⌘F)"
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200"
      >
        <Search size={13} />
        <span className="hidden sm:inline">Find</span>
      </button>

      {/* ── Report Issue ──────────────────────────────────────────── */}
      <ReportIssueButton variant="icon" />

      {/* ── Export dropdown ───────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={() => setExportMenuOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
        >
          <Download size={12} />
          Export
          <ChevronDown size={11} className="opacity-70" />
        </button>

        {exportMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
              <button
                onClick={() => { setExportMenuOpen(false); onExportJson(); }}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-700 transition-colors"
              >
                <FileJson size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-200">Backup (.json)</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Import &amp; continue editing later</p>
                </div>
              </button>

              <div className="h-px bg-gray-700 mx-2" />

              <button
                onClick={() => { setExportMenuOpen(false); onExportTxt(); }}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-700 transition-colors"
              >
                <FileText size={14} className="text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-200">Read offline (.txt)</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Formatted script for rehearsal</p>
                </div>
              </button>

              <div className="h-px bg-gray-700 mx-2" />

              <button
                onClick={() => { setExportMenuOpen(false); onExportPdf(); }}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-700 transition-colors"
              >
                <Printer size={14} className="text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-200">Export as PDF</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Print or save via browser dialog</p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      </div>{/* end inner scroll container */}
    </header>
  );
}

/** Reusable toggle pill */
function TogglePill({ on, color = 'blue' }: { on: boolean; color?: 'blue' | 'violet' | 'green' }) {
  const activeColor = color === 'violet' ? 'bg-violet-500' : color === 'green' ? 'bg-green-600' : 'bg-blue-500';
  return (
    <span
      className={cn(
        'relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200',
        on ? activeColor : 'bg-gray-600'
      )}
    >
      <span
        className={cn(
          'inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 mt-0.5',
          on ? 'translate-x-3.5' : 'translate-x-0.5'
        )}
      />
    </span>
  );
}

/** Tiny 40×28px visual preview of each page style */
function PageStylePreview({ style }: { style: PageStyle }) {
  const base = 'w-10 h-7 rounded border border-gray-600 overflow-hidden shrink-0';
  if (style === 'plain') {
    return <div className={cn(base, 'bg-white')} />;
  }
  if (style === 'dotted') {
    return (
      <div
        className={cn(base, 'bg-white')}
        style={{
          backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)',
          backgroundSize: '6px 6px',
        }}
      />
    );
  }
  if (style === 'lined') {
    return (
      <div
        className={cn(base, 'bg-white')}
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent 0px, transparent 5px, #c5ced8 5px, #c5ced8 6px)',
          backgroundSize: '100% 6px',
        }}
      />
    );
  }
  // grid
  return (
    <div
      className={cn(base, 'bg-white')}
      style={{
        backgroundImage:
          'linear-gradient(#c5ced8 1px, transparent 1px), linear-gradient(90deg, #c5ced8 1px, transparent 1px)',
        backgroundSize: '6px 6px',
      }}
    />
  );
}

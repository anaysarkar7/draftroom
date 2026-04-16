'use client';

import { use, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScriptStore } from '@/store/scriptStore';
import { ScreenplayEditor } from '@/components/editor/ScreenplayEditor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { FormattingToolbar } from '@/components/editor/FormattingToolbar';
import { SceneNavigator } from '@/components/editor/SceneNavigator';
import { StatusBar } from '@/components/editor/StatusBar';
import { ScriptAnalysisModal } from '@/components/editor/ScriptAnalysisModal';
import { SceneBreakdownModal } from '@/components/editor/SceneBreakdownModal';
import { CommentsPanel } from '@/components/editor/CommentsPanel';
import { AddCommentPopover } from '@/components/editor/AddCommentPopover';
import { BeatBoard } from '@/components/editor/BeatBoard';
import { FindReplacePanel } from '@/components/editor/FindReplacePanel';
import { exportScriptAsJSON, exportScriptAsTxt } from '@/lib/script-io';
import type { Editor } from '@tiptap/core';
import type { PageStyle, NavScene, SceneBreakdownData, TitlePageData, InlineComment, ElementType } from '@/types/screenplay';
import { defaultTitlePage } from '@/components/editor/TitlePageEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditorClient({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    getScript, updateScript, updateSceneBreakdown, updateTitlePage,
    addComment, updateComment, deleteComment,
    updateBeatNote, updateBeatColor,
  } = useScriptStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const script = getScript(id);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [pageCount, setPageCount] = useState(1);

  // ── View options ────────────────────────────────────────────────────────
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showSceneNumbers, setShowSceneNumbers] = useState(false);
  const [pageStyle, setPageStyle] = useState<PageStyle>('plain');
  const [darkMode, setDarkMode] = useState(false);

  // ── Find & Replace ───────────────────────────────────────────────────────
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findReplaceMode, setFindReplaceMode] = useState<'find' | 'replace'>('find');
  const [findReplaceElementType, setFindReplaceElementType] = useState<ElementType | null>(null);

  // ── Panel / modal state ─────────────────────────────────────────────────
  const [showAnalysis, setShowAnalysis]     = useState(false);
  const [breakdownScene, setBreakdownScene] = useState<NavScene | null>(null);
  const [showTitlePage, setShowTitlePage]   = useState(false);
  const [showComments, setShowComments]     = useState(false);
  const [showBeatBoard, setShowBeatBoard]   = useState(false);

  // ── Comment popover state ───────────────────────────────────────────────
  const [commentPopoverPos, setCommentPopoverPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (mounted && script) setPageCount(script.pageCount ?? 1);
  }, [mounted, script]);

  useEffect(() => {
    if (mounted && !script) router.replace('/dashboard');
  }, [mounted, script, router]);

  // ── Find & Replace keyboard shortcut (⌘F / ⌘H) ─────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === 'f') {
        e.preventDefault();
        setFindReplaceMode('find');
        setFindReplaceElementType(null);
        setFindReplaceOpen(true);
      } else if (e.key === 'h') {
        e.preventDefault();
        setFindReplaceMode('replace');
        setFindReplaceElementType(null);
        setFindReplaceOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenFindReplace = useCallback((mode: 'find' | 'replace' = 'find') => {
    setFindReplaceMode(mode);
    setFindReplaceElementType(null);
    setFindReplaceOpen(true);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleUpdate = useCallback(
    (content: string, pages: number) => {
      if (!script) return;
      setIsSaved(false);
      setPageCount(pages);
      updateScript(id, { content, pageCount: pages });
      setTimeout(() => setIsSaved(true), 600);
    },
    [id, script, updateScript]
  );

  const handleTitleChange = useCallback(
    (title: string) => updateScript(id, { title }),
    [id, updateScript]
  );

  const handleExportJson = useCallback(() => { if (script) exportScriptAsJSON(script); }, [script]);
  const handleExportTxt  = useCallback(() => { if (script) exportScriptAsTxt(script); }, [script]);
  const handleExportPdf  = useCallback(() => { window.print(); }, []);

  const handleSaveBreakdown = useCallback(
    (data: SceneBreakdownData) => {
      if (!breakdownScene) return;
      updateSceneBreakdown(id, breakdownScene.text, data);
    },
    [id, breakdownScene, updateSceneBreakdown]
  );

  const handleTitlePageChange = useCallback(
    (data: TitlePageData) => updateTitlePage(id, data),
    [id, updateTitlePage]
  );

  const getTitlePageData = (): TitlePageData =>
    script?.titlePage ?? defaultTitlePage(script?.title ?? '', script?.author ?? '');

  // ── Comment handlers ────────────────────────────────────────────────────

  /** Open the Add Comment popover near the current selection */
  const handleAddCommentClick = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return; // nothing selected

    const coords = editor.view.coordsAtPos(from);
    setCommentPopoverPos({ top: coords.top - 20, left: coords.left });
  }, [editor]);

  /** Apply the comment mark and save to store */
  const handleCommentSubmit = useCallback(
    (text: string, color: string) => {
      if (!editor) return;
      const commentId = crypto.randomUUID();
      // Apply the mark over the current selection
      editor
        .chain()
        .focus()
        .setMark('commentMark', { commentId, color })
        .run();

      const comment: InlineComment = {
        id: commentId,
        text,
        color,
        createdAt: new Date().toISOString(),
      };
      addComment(id, comment);
      setCommentPopoverPos(null);
      setShowComments(true); // auto-open the panel
    },
    [editor, id, addComment]
  );

  /** Remove the comment mark from the document and delete from store */
  const handleDeleteComment = useCallback(
    (commentId: string) => {
      if (editor) {
        // Remove all marks with this commentId
        const { doc } = editor.state;
        const tr = editor.state.tr;
        doc.descendants((node, pos) => {
          if (!node.isText) return;
          node.marks.forEach((mark) => {
            if (mark.type.name === 'commentMark' && mark.attrs.commentId === commentId) {
              tr.removeMark(pos, pos + node.nodeSize, mark.type);
            }
          });
        });
        editor.view.dispatch(tr);
      }
      deleteComment(id, commentId);
    },
    [editor, id, deleteComment]
  );

  const handleResolveComment = useCallback(
    (commentId: string) => updateComment(id, commentId, { resolved: true }),
    [id, updateComment]
  );

  // ── Beat Board handlers ─────────────────────────────────────────────────
  const handleBeatNoteChange = useCallback(
    (sceneKey: string, note: string) => updateBeatNote(id, sceneKey, note),
    [id, updateBeatNote]
  );

  const handleBeatColorChange = useCallback(
    (sceneKey: string, color: string) => updateBeatColor(id, sceneKey, color),
    [id, updateBeatColor]
  );

  // ── Guards ──────────────────────────────────────────────────────────────
  if (!mounted || !script) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-500 text-sm">
        Loading…
      </div>
    );
  }

  const comments = script.comments ?? {};
  const activeCommentCount = Object.values(comments).filter((c) => !c.resolved).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950">

      {/* ── Top toolbar ─────────────────────────────────────────────── */}
      <EditorToolbar
        editor={editor}
        title={script.title}
        format={script.format}
        isSaved={isSaved}
        onTitleChange={handleTitleChange}
        onExportJson={handleExportJson}
        onExportTxt={handleExportTxt}
        onExportPdf={handleExportPdf}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={() => setShowLineNumbers((v) => !v)}
        pageStyle={pageStyle}
        onPageStyleChange={setPageStyle}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
        onOpenAnalysis={() => setShowAnalysis(true)}
        showTitlePage={showTitlePage}
        onToggleTitlePage={() => setShowTitlePage((v) => !v)}
        showComments={showComments}
        onToggleComments={() => setShowComments((v) => !v)}
        commentCount={activeCommentCount}
        onOpenBeatBoard={() => setShowBeatBoard(true)}
        showSceneNumbers={showSceneNumbers}
        onToggleSceneNumbers={() => setShowSceneNumbers((v) => !v)}
        onOpenFindReplace={handleOpenFindReplace}
      />

      {/* ── Formatting toolbar (secondary row) ──────────────────────── */}
      <FormattingToolbar
        editor={editor}
        onAddComment={handleAddCommentClick}
        showCommentBtn
      />

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Scene navigator (left) */}
        <SceneNavigator
          editor={editor}
          onOpenBreakdown={setBreakdownScene}
        />

        {/* Script editor (centre) */}
        <ScreenplayEditor
          content={script.content}
          onUpdate={handleUpdate}
          onPageCountChange={setPageCount}
          onEditorReady={setEditor}
          showLineNumbers={showLineNumbers}
          showSceneNumbers={showSceneNumbers}
          pageStyle={pageStyle}
          darkMode={darkMode}
          showTitlePage={showTitlePage}
          titlePageData={getTitlePageData()}
          onTitlePageChange={handleTitlePageChange}
        />

        {/* Comments panel (right, toggleable) */}
        {showComments && (
          <aside className="w-64 shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
            <CommentsPanel
              editor={editor}
              comments={comments}
              onResolve={handleResolveComment}
              onDelete={handleDeleteComment}
            />
          </aside>
        )}
      </div>

      {/* ── Status bar ──────────────────────────────────────────────── */}
      <StatusBar editor={editor} pageCount={pageCount} />

      {/* ── Modals & overlays ───────────────────────────────────────── */}

      {showAnalysis && (
        <ScriptAnalysisModal
          script={script}
          pageCount={pageCount}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {breakdownScene && (
        <SceneBreakdownModal
          scene={breakdownScene}
          breakdownData={script.sceneBreakdowns?.[breakdownScene.text]}
          onSave={handleSaveBreakdown}
          onClose={() => setBreakdownScene(null)}
        />
      )}

      {/* Add comment popover */}
      <AddCommentPopover
        position={commentPopoverPos}
        onSubmit={handleCommentSubmit}
        onClose={() => setCommentPopoverPos(null)}
      />

      {/* Find & Replace panel */}
      {findReplaceOpen && (
        <FindReplacePanel
          editor={editor}
          initialMode={findReplaceMode}
          initialElementType={findReplaceElementType}
          onClose={() => setFindReplaceOpen(false)}
        />
      )}

      {/* Beat Board full-screen overlay */}
      {showBeatBoard && (
        <BeatBoard
          editor={editor}
          scriptContent={script.content}
          beatNotes={script.beatNotes ?? {}}
          beatColors={script.beatColors ?? {}}
          onBeatNoteChange={handleBeatNoteChange}
          onBeatColorChange={handleBeatColorChange}
          onClose={() => setShowBeatBoard(false)}
        />
      )}
    </div>
  );
}

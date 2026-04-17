'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { ScreenplayElement, ScreenplayDocument } from '@/extensions/ScreenplayElement';
import { DualDialogue, DualColumn } from '@/extensions/DualDialogue';
import { ScreenplayKeymap } from '@/extensions/ScreenplayKeymap';
import { CommentMark } from '@/extensions/CommentMark';
import { useEffect, useCallback, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { PageStyle, TitlePageData } from '@/types/screenplay';
import { cn } from '@/lib/utils';
import { CharacterAutocomplete } from './CharacterAutocomplete';
import { TitlePageEditor } from './TitlePageEditor';

/** US-Letter page height at 96 dpi */
const PAGE_HEIGHT_PX = 1056;

const PLACEHOLDERS: Record<string, string> = {
  scene_heading: 'INT. LOCATION - DAY',
  action: 'Action description...',
  character: 'CHARACTER NAME',
  parenthetical: '(beat)',
  dialogue: 'Dialogue...',
  transition: 'CUT TO:',
  shot: 'CLOSE ON:',
  act_break: 'ACT ONE',
};

interface ScreenplayEditorProps {
  content: string;
  onUpdate: (content: string, pageCount: number) => void;
  onPageCountChange?: (pageCount: number) => void;
  onEditorReady?: (editor: Editor) => void;
  showLineNumbers?: boolean;
  showSceneNumbers?: boolean;
  pageStyle?: PageStyle;
  darkMode?: boolean;
  /** Title page props */
  showTitlePage?: boolean;
  titlePageData?: TitlePageData;
  onTitlePageChange?: (data: TitlePageData) => void;
}

export function ScreenplayEditor({
  content,
  onUpdate,
  onPageCountChange,
  onEditorReady,
  showLineNumbers = false,
  showSceneNumbers = false,
  pageStyle = 'plain',
  darkMode = false,
  showTitlePage = false,
  titlePageData,
  onTitlePageChange,
}: ScreenplayEditorProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const measuredPageCount = useRef(1);
  const [displayPageCount, setDisplayPageCount] = useState(1);

  const updatePageCount = useCallback(() => {
    if (!pageRef.current) return;
    const h = pageRef.current.scrollHeight;
    const count = Math.max(1, Math.ceil(h / PAGE_HEIGHT_PX));
    if (count !== measuredPageCount.current) {
      measuredPageCount.current = count;
      setDisplayPageCount(count);
      onPageCountChange?.(count);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ScreenplayDocument,
      StarterKit.configure({
        document: false,
        paragraph: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        // ── Enabled formatting marks ──
        bold: {},
        italic: {},
        strike: {},
        code: false,
        hardBreak: false,
      }),
      // ── Extra formatting ──
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      // ── Screenplay ──
      ScreenplayElement,
      DualDialogue,
      DualColumn,
      ScreenplayKeymap,
      CommentMark,
      Placeholder.configure({
        placeholder: ({ node }) => PLACEHOLDERS[node.attrs.elementType] ?? '',
      }),
      CharacterCount,
    ],
    content: (() => {
      try {
        return content ? JSON.parse(content) : undefined;
      } catch {
        return undefined;
      }
    })(),
    onUpdate: ({ editor: e }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const json = JSON.stringify(e.getJSON());
        onUpdate(json, measuredPageCount.current);
      }, 800);
    },
    editorProps: {
      attributes: {
        class: 'screenplay-content outline-none',
        spellCheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!pageRef.current) return;
    const ro = new ResizeObserver(updatePageCount);
    ro.observe(pageRef.current);
    updatePageCount();
    return () => ro.disconnect();
  }, [updatePageCount]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <div className="screenplay-wrap flex-1 overflow-y-auto bg-gray-950 flex justify-center py-4 px-2 md:py-12 md:px-4">
      <div className="relative flex flex-col items-center gap-0 w-full max-w-[816px]">

        {/* ── Title Page (optional) ──────────────────────────────────── */}
        {showTitlePage && titlePageData && onTitlePageChange && (
          <div className="mb-8 w-full">
            <TitlePageEditor
              data={titlePageData}
              onChange={onTitlePageChange}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* ── Script pages ──────────────────────────────────────────── */}
        <div className="relative w-full">
          {/* Page number labels — only show on md+ where margins exist */}
          {Array.from({ length: displayPageCount }, (_, i) => (
            <div
              key={i}
              className="absolute pointer-events-none select-none hidden md:block"
              style={{
                top: `${i * PAGE_HEIGHT_PX + 96}px`,
                right: 'calc(100% + 14px)',
                textAlign: 'right',
              }}
            >
              <span className="text-[10px] font-mono text-gray-600 leading-none">
                {i + 1}
              </span>
            </div>
          ))}

          <div
            ref={pageRef}
            className={cn(
              // Mobile: full-width with compact padding
              // Desktop (md+): fixed 816px with WGA-standard 1in margins
              'screenplay-page shadow-2xl relative w-full',
              'px-5 pt-10 pb-10',
              'sm:px-10 sm:pt-14 sm:pb-14',
              'md:w-[816px] md:px-[96px] md:pt-[96px] md:pb-[96px]',
              showLineNumbers && 'show-line-numbers',
              showSceneNumbers && 'show-scene-numbers',
              darkMode && 'page-dark'
            )}
            data-page-style={darkMode ? undefined : pageStyle}
            style={{ minHeight: `${PAGE_HEIGHT_PX}px` }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Character name autocomplete — floats above everything */}
      <CharacterAutocomplete editor={editor} />
    </div>
  );
}

export type { Editor };

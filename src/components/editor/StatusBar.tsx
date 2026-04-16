'use client';

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { ElementType } from '@/types/screenplay';
import { ELEMENT_LABELS } from '@/types/screenplay';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<ElementType, string> = {
  scene_heading: 'bg-amber-500',
  action: 'bg-gray-500',
  character: 'bg-blue-500',
  parenthetical: 'bg-purple-500',
  dialogue: 'bg-green-500',
  transition: 'bg-red-500',
  shot: 'bg-orange-500',
  act_break: 'bg-cyan-500',
};

interface StatusBarProps {
  editor: Editor | null;
  pageCount: number;
}

export function StatusBar({ editor, pageCount }: StatusBarProps) {
  const [elementType, setElementType] = useState<ElementType>('action');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { $from } = editor.state.selection;
      const node = $from.node();
      if (node?.type.name === 'screenplayElement') {
        setElementType(node.attrs.elementType as ElementType);
      }
      // Rough word count
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    };

    update();
    editor.on('transaction', update);
    return () => { editor.off('transaction', update); };
  }, [editor]);

  return (
    <footer className="h-8 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-4 text-xs text-gray-500 shrink-0">
      {/* Element type indicator */}
      <div className="flex items-center gap-1.5">
        <span className={cn('w-2 h-2 rounded-full', TYPE_COLORS[elementType])} />
        <span>{ELEMENT_LABELS[elementType]}</span>
      </div>

      <span className="text-gray-700">·</span>

      {/* Page count */}
      <span>
        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
      </span>

      <span className="text-gray-700">·</span>

      {/* Word count */}
      <span>{wordCount.toLocaleString()} words</span>

      <div className="flex-1" />

      {/* Keyboard hint */}
      <span className="text-gray-700 hidden md:block">
        Tab to switch element · Enter for next · ⌘1–8 for types
      </span>
    </footer>
  );
}

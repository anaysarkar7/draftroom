'use client';

/**
 * CommentsPanel
 * ─────────────
 * A right-side collapsible panel showing all inline comments/notes for the
 * current script.  Each comment is clickable to scroll to and highlight the
 * annotated text in the editor.
 *
 * Features:
 *   • Colour-coded comment cards
 *   • Resolve / delete actions
 *   • Click to scroll-to in editor (by commentId mark in DOM)
 *   • Resolved comments are dimmed and shown at the bottom
 */

import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { InlineComment } from '@/types/screenplay';
import {
  MessageSquare,
  Check,
  Trash2,
  ChevronRight,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  editor: Editor | null;
  comments: Record<string, InlineComment>;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CommentsPanel({ editor, comments, onResolve, onDelete }: Props) {
  const [showResolved, setShowResolved] = useState(false);

  const allComments = Object.values(comments);
  const active   = allComments.filter((c) => !c.resolved).sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);
  const resolved = allComments.filter((c) =>  c.resolved).sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);

  const scrollToComment = (commentId: string) => {
    // Find the DOM element with matching data-comment-id
    const el = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Briefly flash the mark
      (el as HTMLElement).style.transition = 'filter 0.2s';
      (el as HTMLElement).style.filter = 'brightness(0.7)';
      setTimeout(() => {
        (el as HTMLElement).style.filter = '';
      }, 600);
    }
  };

  if (allComments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 gap-3">
        <StickyNote size={28} className="text-gray-700" />
        <p className="text-xs text-gray-500 leading-relaxed">
          No notes yet.<br />
          Select text in the editor and click <strong className="text-gray-400">Add Note</strong> to annotate.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
          <MessageSquare size={12} />
          Notes
          <span className="ml-1 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {active.length}
          </span>
        </span>
      </div>

      {/* Active comments */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
        {active.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onClick={() => scrollToComment(comment.id)}
            onResolve={() => onResolve(comment.id)}
            onDelete={() => onDelete(comment.id)}
          />
        ))}

        {/* Resolved section */}
        {resolved.length > 0 && (
          <>
            <button
              onClick={() => setShowResolved((v) => !v)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-gray-500 hover:text-gray-400 transition-colors"
            >
              <ChevronRight
                size={11}
                className={cn('transition-transform', showResolved && 'rotate-90')}
              />
              {resolved.length} resolved
            </button>
            {showResolved &&
              resolved.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  resolved
                  onClick={() => scrollToComment(comment.id)}
                  onResolve={() => onResolve(comment.id)}
                  onDelete={() => onDelete(comment.id)}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Individual comment card ─────────────────────────────────────────────────

function CommentCard({
  comment,
  resolved = false,
  onClick,
  onResolve,
  onDelete,
}: {
  comment: InlineComment;
  resolved?: boolean;
  onClick: () => void;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [hovering, setHovering] = useState(false);
  const date = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
      className={cn(
        'group relative rounded-lg px-3 py-2.5 cursor-pointer transition-all border',
        resolved
          ? 'opacity-50 bg-gray-800/40 border-gray-800'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      )}
    >
      {/* Colour stripe on left */}
      <div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
        style={{ backgroundColor: comment.color }}
      />

      {/* Date */}
      <p className="text-[9px] text-gray-600 mb-1">{date}</p>

      {/* Note text */}
      <p className={cn(
        'text-xs leading-relaxed break-words',
        resolved ? 'text-gray-500 line-through' : 'text-gray-200'
      )}>
        {comment.text}
      </p>

      {/* Action buttons (visible on hover) */}
      {hovering && (
        <div className="absolute top-1.5 right-1.5 flex gap-0.5" onClick={(e) => e.stopPropagation()}>
          {!resolved && (
            <button
              onClick={onResolve}
              title="Resolve"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-green-700/40 text-gray-500 hover:text-green-400 transition-colors"
            >
              <Check size={10} />
            </button>
          )}
          <button
            onClick={onDelete}
            title="Delete"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-700/40 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

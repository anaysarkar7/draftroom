import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * CommentMark
 * ───────────
 * A Tiptap inline Mark that tags a text range with a `commentId`.
 * Multiple characters can share the same commentId if the mark was applied
 * across a selection; they all get the same background highlight colour.
 *
 * The mark is rendered as a `<mark>` element with data attributes so we can
 * style it via CSS and find it in the DOM for scroll-to behaviour.
 */
export const CommentMark = Mark.create({
  name: 'commentMark',
  inclusive: false,   // new text typed at the edge won't inherit the mark
  excludes: '',       // allow multiple comment marks to overlap (additive)

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-comment-id'),
        renderHTML: (attrs) => ({ 'data-comment-id': attrs.commentId }),
      },
      color: {
        default: '#fef08a',  // default: yellow highlight
        parseHTML: (el) => el.getAttribute('data-comment-color') ?? '#fef08a',
        renderHTML: (attrs) => ({ 'data-comment-color': attrs.color }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'mark[data-comment-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(HTMLAttributes, { class: 'comment-mark' }),
      0,
    ];
  },
});

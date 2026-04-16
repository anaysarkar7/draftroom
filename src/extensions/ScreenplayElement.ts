import { Node, mergeAttributes } from '@tiptap/core';
import type { ElementType } from '@/types/screenplay';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    screenplayElement: {
      setElementType: (elementType: ElementType) => ReturnType;
    };
  }
}

export const ScreenplayElement = Node.create({
  name: 'screenplayElement',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      elementType: {
        default: 'action' as ElementType,
        parseHTML: (el) => (el.getAttribute('data-element-type') as ElementType) ?? 'action',
        renderHTML: (attrs) => ({ 'data-element-type': attrs.elementType }),
      },
    };
  },


  parseHTML() {
    return [{ tag: 'div[data-element-type]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'screenplay-element' }), 0];
  },

  addCommands() {
    return {
      setElementType:
        (elementType: ElementType) =>
        ({ commands }) =>
          commands.updateAttributes('screenplayElement', { elementType }),
    };
  },
});

export const ScreenplayDocument = Node.create({
  name: 'doc',
  topNode: true,
  content: '(screenplayElement | dualDialogue)+',
});


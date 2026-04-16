import { Node, mergeAttributes } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dualDialogue: {
      /** Insert a dual-dialogue block (two character+dialogue columns side-by-side) */
      insertDualDialogue: () => ReturnType;
    };
  }
}

/** One column of a dual-dialogue block */
export const DualColumn = Node.create({
  name: 'dualColumn',
  // No group — can only appear inside dualDialogue
  content: 'screenplayElement+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-dual-col]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-dual-col': '', class: 'dual-col' }),
      0,
    ];
  },
});

/** Wrapper that renders two character/dialogue pairs side-by-side */
export const DualDialogue = Node.create({
  name: 'dualDialogue',
  group: 'block',
  content: 'dualColumn dualColumn', // exactly two columns
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-dual-dialogue]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-dual-dialogue': '', class: 'dual-dialogue' }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Delete the entire dualDialogue block when:
      //   (a) cursor is inside and ALL columns are empty, OR
      //   (b) the cursor is right before the node (from outside) and content is empty
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        // Walk up to find the enclosing dualDialogue node
        let blockPos = -1;
        for (let depth = $from.depth; depth >= 0; depth--) {
          if ($from.node(depth).type.name === 'dualDialogue') {
            blockPos = $from.before(depth);
            break;
          }
        }
        if (blockPos === -1) return false;

        const blockNode = state.doc.nodeAt(blockPos);
        if (!blockNode) return false;

        // Check whether ALL content in the block is empty
        const allEmpty = blockNode.textContent.length === 0;
        if (!allEmpty) return false;

        // Replace the entire dualDialogue with a fresh action element
        const { tr } = state;
        const actionNode = state.schema.nodes.screenplayElement.create({
          elementType: 'action',
        });
        tr.replaceWith(blockPos, blockPos + blockNode.nodeSize, actionNode);
        tr.setSelection(TextSelection.near(tr.doc.resolve(blockPos + 1)));
        editor.view.dispatch(tr);
        return true;
      },
    };
  },

  addCommands() {
    return {
      insertDualDialogue:
        () =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: 'dualDialogue',
              content: [
                {
                  type: 'dualColumn',
                  content: [
                    { type: 'screenplayElement', attrs: { elementType: 'character' }, content: [] },
                    { type: 'screenplayElement', attrs: { elementType: 'dialogue' }, content: [] },
                  ],
                },
                {
                  type: 'dualColumn',
                  content: [
                    { type: 'screenplayElement', attrs: { elementType: 'character' }, content: [] },
                    { type: 'screenplayElement', attrs: { elementType: 'dialogue' }, content: [] },
                  ],
                },
              ],
            })
            .run(),
    };
  },
});

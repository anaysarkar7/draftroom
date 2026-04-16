import { Extension } from '@tiptap/core';
import type { ElementType } from '@/types/screenplay';

// What element type to create when pressing Enter after a given type
const ENTER_NEXT: Partial<Record<ElementType, ElementType>> = {
  scene_heading: 'action',
  action: 'action',
  character: 'dialogue',
  parenthetical: 'dialogue',
  dialogue: 'character',
  transition: 'action',
  shot: 'action',
  act_break: 'action',
};

// What to switch to when pressing Tab from a given type
const TAB_NEXT: Partial<Record<ElementType, ElementType>> = {
  action: 'character',
  character: 'action',
  dialogue: 'parenthetical',
  parenthetical: 'dialogue',
  act_break: 'action',
};

const ALL_TYPES: ElementType[] = [
  'scene_heading',
  'action',
  'character',
  'dialogue',
  'parenthetical',
  'transition',
  'shot',
  'act_break',
];

/**
 * Walk backwards through the doc from `beforePos` and return the last
 * character name seen before any scene_heading boundary.
 * Strips any existing (CONT'D) suffix.
 */
function findPrevCharacterName(
  doc: import('@tiptap/pm/model').Node,
  beforePos: number
): string {
  let lastCharName = '';
  doc.forEach((node, offset) => {
    if (offset >= beforePos) return;
    if (node.type.name === 'screenplayElement') {
      if (node.attrs.elementType === 'scene_heading') {
        // Reset on scene boundary — a new scene means no CONT'D
        lastCharName = '';
      } else if (node.attrs.elementType === 'character') {
        const text = node.textContent
          .trim()
          .replace(/\s*\(CONT['']D\)\s*$/i, '')
          .trim();
        if (text) lastCharName = text.toUpperCase();
      }
    }
  });
  return lastCharName;
}

/**
 * Walk backwards from `beforePos` and determine whether the SAME character
 * was the last speaker before the current position (with only action/
 * parenthetical/shot elements in between — no scene break, no other character).
 */
function shouldInsertContd(
  doc: import('@tiptap/pm/model').Node,
  beforePos: number,
  characterName: string
): boolean {
  // Collect all relevant nodes before this position
  const nodes: { type: string; text: string }[] = [];
  doc.forEach((node, offset) => {
    if (offset >= beforePos) return;
    if (node.type.name === 'screenplayElement') {
      nodes.push({
        type: node.attrs.elementType as string,
        text: node.textContent
          .trim()
          .replace(/\s*\(CONT['']D\)\s*$/i, '')
          .trim()
          .toUpperCase(),
      });
    }
  });

  // Walk backwards through the collected nodes
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (n.type === 'dialogue' || n.type === 'parenthetical') continue;
    if (n.type === 'character') {
      // The last character we find: is it the same name?
      return n.text === characterName.toUpperCase();
    }
    // Any other type (scene_heading, action, transition, shot, act_break)
    // breaks the continuation chain
    return false;
  }
  return false;
}

export const ScreenplayKeymap = Extension.create({
  name: 'screenplayKeymap',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;
        const node = $from.node();
        if (node.type.name !== 'screenplayElement') return false;

        const currentType = node.attrs.elementType as ElementType;
        const text = node.textContent.trim();

        // Empty character/dialogue → jump back to action
        if ((currentType === 'character' || currentType === 'dialogue') && text === '') {
          return editor.chain().updateAttributes('screenplayElement', { elementType: 'action' }).run();
        }

        const nextType = ENTER_NEXT[currentType] ?? 'action';

        // ── CONT'D auto-insertion ─────────────────────────────────────────
        // When pressing Enter from dialogue, the next element is "character".
        // If the last character to speak (before any interrupting action) was
        // the same person, we pre-fill with NAME (CONT'D).
        if (currentType === 'dialogue' && nextType === 'character') {
          // Position of the node that is ABOUT to be split (before current node)
          const nodeStartPos = $from.before();
          const prevCharName = findPrevCharacterName(editor.state.doc, nodeStartPos);

          if (prevCharName) {
            const contdText = `${prevCharName} (CONT'D)`;
            return editor
              .chain()
              .splitBlock()
              .updateAttributes('screenplayElement', { elementType: 'character' })
              .insertContent(contdText)
              .run();
          }
        }

        return editor
          .chain()
          .splitBlock()
          .updateAttributes('screenplayElement', { elementType: nextType })
          .run();
      },

      Tab: ({ editor }) => {
        const { $from } = editor.state.selection;
        const node = $from.node();
        if (node.type.name !== 'screenplayElement') return false;

        const currentType = node.attrs.elementType as ElementType;
        const nextType = TAB_NEXT[currentType];
        if (!nextType) return false;

        return editor.chain().updateAttributes('screenplayElement', { elementType: nextType }).run();
      },

      'Shift-Tab': ({ editor }) => {
        const { $from } = editor.state.selection;
        const node = $from.node();
        if (node.type.name !== 'screenplayElement') return false;

        const currentType = node.attrs.elementType as ElementType;
        const idx = ALL_TYPES.indexOf(currentType);
        const prevType = ALL_TYPES[(idx - 1 + ALL_TYPES.length) % ALL_TYPES.length];
        return editor.chain().updateAttributes('screenplayElement', { elementType: prevType }).run();
      },

      // ⌘1-8 for quick element type switching
      'Mod-1': ({ editor }) => editor.chain().setElementType('scene_heading').run(),
      'Mod-2': ({ editor }) => editor.chain().setElementType('action').run(),
      'Mod-3': ({ editor }) => editor.chain().setElementType('character').run(),
      'Mod-4': ({ editor }) => editor.chain().setElementType('parenthetical').run(),
      'Mod-5': ({ editor }) => editor.chain().setElementType('dialogue').run(),
      'Mod-6': ({ editor }) => editor.chain().setElementType('transition').run(),
      'Mod-7': ({ editor }) => editor.chain().setElementType('shot').run(),
      'Mod-8': ({ editor }) => editor.chain().setElementType('act_break').run(),
    };
  },
});

export { shouldInsertContd };

import type { CharacterStats } from '@/types/screenplay';

interface TiptapNode {
  type: string;
  attrs?: Record<string, string>;
  content?: TiptapNode[];
  text?: string;
}

function extractText(node: TiptapNode): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractText).join('');
  return '';
}

/** Walk all screenplay element nodes, including those inside dualDialogue/dualColumn */
function flattenNodes(nodes: TiptapNode[]): TiptapNode[] {
  const result: TiptapNode[] = [];
  for (const node of nodes) {
    if (node.type === 'screenplayElement') {
      result.push(node);
    } else if (
      (node.type === 'dualDialogue' || node.type === 'dualColumn') &&
      node.content
    ) {
      result.push(...flattenNodes(node.content));
    }
  }
  return result;
}

export interface ScriptAnalysis {
  characters: CharacterStats[];
  totalWords: number;
  dialogueWords: number;
  actionWords: number;
  sceneCount: number;
  /** Estimated run time in minutes (totalWords / 150 wpm narration rate) */
  estimatedRunTime: number;
}

/**
 * Parse a stringified Tiptap JSON document and return character + script stats.
 */
export function analyzeScript(content: string): ScriptAnalysis {
  const empty: ScriptAnalysis = {
    characters: [],
    totalWords: 0,
    dialogueWords: 0,
    actionWords: 0,
    sceneCount: 0,
    estimatedRunTime: 0,
  };

  let doc: { content?: TiptapNode[] };
  try {
    doc = JSON.parse(content);
  } catch {
    return empty;
  }

  const nodes = flattenNodes(doc.content ?? []);

  const charMap = new Map<string, { lines: number; words: number; scenes: Set<number> }>();
  let currentChar = '';
  let sceneCount = 0;
  let totalWords = 0;
  let dialogueWords = 0;
  let actionWords = 0;

  for (const node of nodes) {
    const type = node.attrs?.elementType ?? '';
    const text = extractText(node).trim();
    if (!text) continue;

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    totalWords += wordCount;

    if (type === 'scene_heading') {
      sceneCount++;
      currentChar = '';
    } else if (type === 'character') {
      currentChar = text.toUpperCase().replace(/\s*\(.*?\)\s*$/, '').trim(); // strip V.O./O.S.
    } else if (type === 'dialogue') {
      dialogueWords += wordCount;
      if (currentChar) {
        if (!charMap.has(currentChar)) {
          charMap.set(currentChar, { lines: 0, words: 0, scenes: new Set() });
        }
        const s = charMap.get(currentChar)!;
        s.lines++;
        s.words += wordCount;
        s.scenes.add(sceneCount);
      }
    } else if (type === 'action') {
      actionWords += wordCount;
      currentChar = ''; // reset current speaker after action block
    } else if (type !== 'parenthetical') {
      currentChar = '';
    }
  }

  const characters: CharacterStats[] = Array.from(charMap.entries())
    .map(([name, data]) => ({
      name,
      dialogueLines: data.lines,
      totalWords: data.words,
      scenesAppeared: data.scenes.size,
      estimatedMinutes: Math.round((data.words / 125) * 10) / 10,
    }))
    .sort((a, b) => b.dialogueLines - a.dialogueLines);

  return {
    characters,
    totalWords,
    dialogueWords,
    actionWords,
    sceneCount,
    estimatedRunTime: Math.round((totalWords / 150) * 10) / 10,
  };
}

/**
 * Parse a scene heading text into its INT/EXT, location, and time-of-day parts.
 * e.g. "INT. COFFEE SHOP - DAY" → { intExt: "INT", location: "COFFEE SHOP", timeOfDay: "DAY" }
 */
export function parseSceneHeading(text: string): {
  intExt: string;
  location: string;
  timeOfDay: string;
} {
  const match = text
    .toUpperCase()
    .match(/^(INT\.?\/EXT\.?|EXT\.?\/INT\.?|INT\.?|EXT\.?)\s+(.+?)\s*[-–]\s*(.+)$/);
  if (match) {
    return {
      intExt: match[1].replace(/\./g, ''),
      location: match[2].trim(),
      timeOfDay: match[3].trim(),
    };
  }
  // Could not parse — return raw text as location
  return { intExt: '', location: text, timeOfDay: '' };
}

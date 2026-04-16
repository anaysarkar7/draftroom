import type { Script, ScriptFormat } from '@/types/screenplay';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScriptExportPayload {
  _draftroom: 1;
  title: string;
  author: string;
  format: ScriptFormat;
  content: string; // Tiptap JSON stringified
  createdAt: string;
  updatedAt: string;
  pageCount: number;
}

// ─── JSON Export (Backup / Re-import) ────────────────────────────────────────

export function exportScriptAsJSON(script: Script): void {
  const payload: ScriptExportPayload = {
    _draftroom: 1,
    title: script.title,
    author: script.author,
    format: script.format,
    content: script.content,
    createdAt: script.createdAt,
    updatedAt: script.updatedAt,
    pageCount: script.pageCount,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  triggerDownload(blob, `${safeFilename(script.title)}.draftroom.json`);
}

/** Parse and validate a .draftroom.json file. Returns null if invalid. */
export function parseImportedJSON(jsonText: string): ScriptExportPayload | null {
  try {
    const data = JSON.parse(jsonText);
    if (
      data._draftroom === 1 &&
      typeof data.title === 'string' &&
      typeof data.format === 'string' &&
      typeof data.content === 'string'
    ) {
      return data as ScriptExportPayload;
    }
    // Also accept exports that may be missing the _draftroom marker but have the right shape
    if (
      typeof data.title === 'string' &&
      typeof data.format === 'string' &&
      typeof data.content === 'string' &&
      typeof data.createdAt === 'string'
    ) {
      return { _draftroom: 1, ...data } as ScriptExportPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── TXT Export (Offline Reading / Rehearsal) ─────────────────────────────────

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

export function exportScriptAsTxt(script: Script): void {
  const lines: string[] = [];

  // Title page header
  const titleLine = script.title.toUpperCase();
  const pad = Math.max(0, Math.floor((60 - titleLine.length) / 2));
  lines.push(' '.repeat(pad) + titleLine);
  if (script.author) {
    const byLine = `Written by ${script.author}`;
    const padBy = Math.max(0, Math.floor((60 - byLine.length) / 2));
    lines.push(' '.repeat(padBy) + byLine);
  }
  lines.push('');
  lines.push('─'.repeat(60));
  lines.push('');

  let doc: { content?: TiptapNode[] };
  try {
    doc = JSON.parse(script.content);
  } catch {
    triggerDownload(
      new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }),
      `${safeFilename(script.title)}.txt`
    );
    return;
  }

  const nodes = doc.content ?? [];

  for (const node of nodes) {
    if (node.type !== 'screenplayElement') continue;
    const elementType = node.attrs?.elementType ?? 'action';
    const text = extractText(node);
    if (!text.trim()) continue;

    switch (elementType) {
      case 'scene_heading':
        lines.push('');
        lines.push(text.toUpperCase());
        lines.push('');
        break;
      case 'action':
        lines.push(text);
        lines.push('');
        break;
      case 'character':
        lines.push('');
        lines.push(' '.repeat(28) + text.toUpperCase());
        break;
      case 'parenthetical':
        lines.push(' '.repeat(22) + (text.startsWith('(') ? text : `(${text})`));
        break;
      case 'dialogue':
        lines.push(' '.repeat(16) + text);
        lines.push('');
        break;
      case 'transition':
        lines.push('');
        lines.push(' '.repeat(44) + text.toUpperCase());
        lines.push('');
        break;
      case 'shot':
        lines.push('');
        lines.push(text.toUpperCase());
        lines.push('');
        break;
      default:
        lines.push(text);
        lines.push('');
    }
  }

  triggerDownload(
    new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }),
    `${safeFilename(script.title)}.txt`
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeFilename(title: string): string {
  return title.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim() || 'script';
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

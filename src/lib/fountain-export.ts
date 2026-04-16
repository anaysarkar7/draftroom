import type { ElementType, Script } from '@/types/screenplay';

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

export function exportToFountain(script: Script): string {
  const lines: string[] = [];

  // Title page
  lines.push(`Title: ${script.title}`);
  if (script.author) lines.push(`Author: ${script.author}`);
  lines.push('');
  lines.push('===');
  lines.push('');

  let doc: { content?: TiptapNode[] };
  try {
    doc = JSON.parse(script.content);
  } catch {
    return lines.join('\n');
  }

  const nodes = doc.content ?? [];

  for (const node of nodes) {
    if (node.type !== 'screenplayElement') continue;

    const elementType = (node.attrs?.elementType ?? 'action') as ElementType;
    const text = extractText(node);

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
        lines.push(text.toUpperCase());
        break;
      case 'parenthetical':
        lines.push(text.startsWith('(') ? text : `(${text})`);
        break;
      case 'dialogue':
        lines.push(text);
        lines.push('');
        break;
      case 'transition':
        lines.push('');
        lines.push(`> ${text.toUpperCase()}`);
        lines.push('');
        break;
      case 'shot':
        lines.push('');
        lines.push(`.${text.toUpperCase()}`);
        lines.push('');
        break;
      default:
        lines.push(text);
    }
  }

  return lines.join('\n');
}

export function downloadFountain(script: Script): void {
  const content = exportToFountain(script);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${script.title.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'script'}.fountain`;
  a.click();
  URL.revokeObjectURL(url);
}

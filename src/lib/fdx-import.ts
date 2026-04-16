/**
 * fdx-import.ts
 * ─────────────
 * Parses a Final Draft (.fdx) XML file and converts it into a DraftRoom
 * Tiptap JSON document + script metadata.
 *
 * Final Draft .fdx format (XML):
 * ────────────────────────────────────────────────────────────────────────────
 *   <FinalDraft DocumentType="Script" Version="1">
 *     <Content>
 *       <Paragraph Type="Scene Heading">
 *         <Text>INT. COFFEE SHOP - DAY</Text>
 *       </Paragraph>
 *       <Paragraph Type="Character">
 *         <Text Style="Bold">SARAH</Text>
 *       </Paragraph>
 *       ...
 *     </Content>
 *     <TitlePage>
 *       <Content>
 *         <Paragraph Type="Title"><Text>MY SCRIPT</Text></Paragraph>
 *         <Paragraph Type="Author"><Text>Jane Smith</Text></Paragraph>
 *       </Content>
 *     </TitlePage>
 *   </FinalDraft>
 *
 * Text Style attribute values (separated by '+'):
 *   Bold · Italic · Underline · Strikethrough · AllCaps · SmallCaps
 * ────────────────────────────────────────────────────────────────────────────
 */

import type { ScriptExportPayload } from './script-io';
import type { TitlePageData } from '@/types/screenplay';

// ─── Internal Tiptap JSON types ──────────────────────────────────────────────

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapText {
  type: 'text';
  text: string;
  marks?: TiptapMark[];
}

interface TiptapScreenplayElement {
  type: 'screenplayElement';
  attrs: { elementType: string };
  content: TiptapText[];
}

interface TiptapDualColumn {
  type: 'dualColumn';
  content: TiptapScreenplayElement[];
}

interface TiptapDualDialogue {
  type: 'dualDialogue';
  content: [TiptapDualColumn, TiptapDualColumn];
}

type TiptapNode = TiptapScreenplayElement | TiptapDualDialogue;

// ─── FDX → ElementType map ───────────────────────────────────────────────────

const FDX_TYPE_MAP: Record<string, string> = {
  'Scene Heading': 'scene_heading',
  'Slugline':      'scene_heading',   // some FDX versions use "Slugline"
  'Action':        'action',
  'Character':     'character',
  'Parenthetical': 'parenthetical',
  'Dialogue':      'dialogue',
  'Transition':    'transition',
  'Shot':          'shot',
  'Act Break':     'act_break',
  'New Act':       'act_break',
  'End of Act':    'act_break',
  // Fall-backs
  'General':       'action',
  'Centered':      'action',
  'Cast List':     'action',
  'Lyrics':        'dialogue',
  'Chorus':        'dialogue',
  'Sign':          'action',
  'More':          'parenthetical',
  'Continued':     'parenthetical',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a <Text Style="Bold+Italic"> element into TiptapText */
function parseTextElement(el: Element): TiptapText | null {
  const raw = el.textContent ?? '';
  if (!raw) return null;

  const style = el.getAttribute('Style') ?? '';
  const marks: TiptapMark[] = [];

  if (style.includes('Bold'))          marks.push({ type: 'bold' });
  if (style.includes('Italic'))        marks.push({ type: 'italic' });
  if (style.includes('Underline'))     marks.push({ type: 'underline' });
  if (style.includes('Strikethrough')) marks.push({ type: 'strike' });

  // Handle colour from Color attribute e.g. "#ffff00000000"
  const color = el.getAttribute('Color');
  if (color && color !== '#000000000000') {
    // Convert 48-bit FDX color "#rrrrggggbbbb" → "#rrggbb"
    const hex6 = fdxColorToHex(color);
    if (hex6) {
      marks.push({ type: 'textStyle', attrs: { color: hex6 } });
    }
  }

  const node: TiptapText = { type: 'text', text: raw };
  if (marks.length > 0) node.marks = marks;
  return node;
}

/** Convert Final Draft 48-bit colour "#rrrrggggbbbb" → "#rrggbb" */
function fdxColorToHex(fdxColor: string): string | null {
  const hex = fdxColor.replace('#', '');
  if (hex.length === 12) {
    const r = hex.slice(0, 2);
    const g = hex.slice(4, 6);
    const b = hex.slice(8, 10);
    return `#${r}${g}${b}`;
  }
  if (hex.length === 6) return `#${hex}`;
  return null;
}

/** Extract all <Text> children of a <Paragraph>, handling missing Text wrappers */
function extractTextNodes(para: Element): TiptapText[] {
  const textEls = Array.from(para.children).filter((c) => c.tagName === 'Text');

  if (textEls.length > 0) {
    return textEls.map(parseTextElement).filter((n): n is TiptapText => n !== null);
  }

  // Some FDX versions embed text directly in the <Paragraph> element
  const direct = para.textContent?.trim() ?? '';
  if (direct) return [{ type: 'text', text: direct }];
  return [];
}

/** Build a single screenplayElement node */
function makeElement(elementType: string, content: TiptapText[]): TiptapScreenplayElement {
  return { type: 'screenplayElement', attrs: { elementType }, content };
}

/**
 * Parse dual-dialogue structure.
 * FDX represents this as a <Paragraph Type="Character"> that contains
 * two <DualDialogue> siblings (each wrapping one speaker's char+dialogue).
 */
function parseDualDialogue(para: Element): TiptapDualDialogue | null {
  const duals = Array.from(para.children).filter((c) => c.tagName === 'DualDialogue');
  if (duals.length < 2) return null;

  const buildColumn = (dd: Element): TiptapDualColumn => {
    const children = Array.from(dd.children).filter((c) => c.tagName === 'Paragraph');
    const nodes: TiptapScreenplayElement[] = children.map((child) => {
      const t = FDX_TYPE_MAP[child.getAttribute('Type') ?? ''] ?? 'dialogue';
      return makeElement(t, extractTextNodes(child));
    });
    return { type: 'dualColumn', content: nodes };
  };

  return {
    type: 'dualDialogue',
    content: [buildColumn(duals[0]), buildColumn(duals[1])],
  };
}

// ─── Title page extraction ────────────────────────────────────────────────────

function extractTitlePage(root: Element, fallbackTitle: string, fallbackAuthor: string): TitlePageData {
  const titlePageContent = root.querySelector('TitlePage > Content');
  let title  = '';
  let author = '';
  let basedOn = '';
  let draftInfo = '';
  let contactInfo = '';
  let copyright = '';
  let writtenBy = 'Written by';

  if (titlePageContent) {
    const paras = Array.from(titlePageContent.querySelectorAll('Paragraph'));
    for (const p of paras) {
      const type = p.getAttribute('Type') ?? '';
      const text = p.textContent?.trim() ?? '';
      if (!text) continue;
      switch (type) {
        case 'Title':      title = text; break;
        case 'Author':     author = text; break;
        case 'WrittenBy':  writtenBy = text; break;
        case 'Copyright':  copyright = text; break;
        case 'Contact':    contactInfo = text; break;
        case 'BasedOn':    basedOn = text; break;
        case 'Draft':
        case 'Revision':   draftInfo = text; break;
      }
    }
  }

  return {
    title:       title  || fallbackTitle.toUpperCase(),
    writtenBy,
    authors:     author || fallbackAuthor,
    basedOn,
    draftInfo,
    contactInfo,
    copyright,
  };
}

// ─── Root attributes ─────────────────────────────────────────────────────────

/** Try to pull the script title from the FDX SmartType list or title page */
function extractTitle(root: Element): string {
  // TitlePage > Content > Paragraph[Type="Title"]
  const titleEl = root.querySelector('TitlePage Content Paragraph[Type="Title"]');
  if (titleEl?.textContent?.trim()) return titleEl.textContent.trim();
  return '';
}

function extractAuthor(root: Element): string {
  const authorEl = root.querySelector('TitlePage Content Paragraph[Type="Author"]');
  if (authorEl?.textContent?.trim()) return authorEl.textContent.trim();
  return '';
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface FdxImportResult {
  payload: ScriptExportPayload;
  titlePageData: TitlePageData;
}

/**
 * Parse a Final Draft .fdx XML string into a DraftRoom import payload.
 * Returns `null` if the file is not a valid FDX document.
 */
export function parseFdx(xmlText: string): FdxImportResult | null {
  // ── 1. Parse XML ──────────────────────────────────────────────────────────
  if (typeof DOMParser === 'undefined') return null; // SSR guard

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Detect parse errors
  if (xmlDoc.querySelector('parsererror')) return null;

  const root = xmlDoc.documentElement;
  if (!root || root.tagName !== 'FinalDraft') return null;

  // ── 2. Extract metadata ───────────────────────────────────────────────────
  const rawTitle  = extractTitle(root);
  const rawAuthor = extractAuthor(root);

  // ── 3. Parse <Content> paragraphs → Tiptap nodes ─────────────────────────
  const contentEl = root.querySelector(':scope > Content');
  if (!contentEl) return null;

  const tiptapNodes: TiptapNode[] = [];

  // Iterate direct children only (handles top-level Paragraphs)
  for (const child of Array.from(contentEl.children)) {
    if (child.tagName !== 'Paragraph') continue;

    const fdxType = child.getAttribute('Type') ?? 'Action';

    // ── Dual dialogue: Paragraph wraps two <DualDialogue> elements ──────────
    const hasDual = Array.from(child.children).some((c) => c.tagName === 'DualDialogue');
    if (hasDual) {
      const dual = parseDualDialogue(child);
      if (dual) {
        tiptapNodes.push(dual);
        continue;
      }
      // Fallback: treat each DualDialogue as flat paragraphs
      for (const dd of Array.from(child.children).filter((c) => c.tagName === 'DualDialogue')) {
        for (const inner of Array.from(dd.children).filter((c) => c.tagName === 'Paragraph')) {
          const t = FDX_TYPE_MAP[inner.getAttribute('Type') ?? ''] ?? 'action';
          const content = extractTextNodes(inner);
          tiptapNodes.push(makeElement(t, content));
        }
      }
      continue;
    }

    // ── Standard paragraph ───────────────────────────────────────────────────
    const elementType = FDX_TYPE_MAP[fdxType] ?? 'action';
    const textNodes   = extractTextNodes(child);

    // Skip completely empty nodes (they don't contribute to document structure)
    if (textNodes.length === 0 && elementType !== 'scene_heading') continue;

    tiptapNodes.push(makeElement(elementType, textNodes));
  }

  // Ensure at least one node so the editor doesn't start empty
  if (tiptapNodes.length === 0) {
    tiptapNodes.push(makeElement('scene_heading', []));
  }

  // ── 4. Derive a clean title from the first scene heading if not found ──────
  let title = rawTitle;
  if (!title) {
    const firstScene = tiptapNodes.find(
      (n): n is TiptapScreenplayElement =>
        n.type === 'screenplayElement' && n.attrs.elementType === 'scene_heading'
    );
    title = firstScene
      ? (firstScene.content.map((t) => t.text).join('') || 'Imported Script')
      : 'Imported Script';
  }

  // ── 5. Determine format ───────────────────────────────────────────────────
  const docType = root.getAttribute('DocumentType') ?? 'Script';
  const format =
    docType.toLowerCase().includes('teleplay') ||
    docType.toLowerCase().includes('episode')
      ? 'teleplay'
      : 'screenplay';

  // ── 6. Build Tiptap document JSON ─────────────────────────────────────────
  const tiptapDoc = {
    type: 'doc',
    content: tiptapNodes,
  };

  // ── 7. Build title page data ──────────────────────────────────────────────
  const titlePageData = extractTitlePage(root, title, rawAuthor);

  // ── 8. Assemble the ScriptExportPayload ───────────────────────────────────
  const now = new Date().toISOString();
  const payload: ScriptExportPayload = {
    _draftroom: 1,
    title,
    author: rawAuthor,
    format,
    content: JSON.stringify(tiptapDoc),
    createdAt: now,
    updatedAt: now,
    pageCount: 1,
  };

  return { payload, titlePageData };
}

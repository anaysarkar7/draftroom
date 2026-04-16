export type ElementType =
  | 'scene_heading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'shot'
  | 'act_break';

export type ScriptFormat = 'screenplay' | 'teleplay' | 'stage_play' | 'audio_drama';

export const FORMAT_LABELS: Record<ScriptFormat, string> = {
  screenplay: 'Screenplay',
  teleplay: 'Teleplay',
  stage_play: 'Stage Play',
  audio_drama: 'Audio Drama',
};

export const ELEMENT_LABELS: Record<ElementType, string> = {
  scene_heading: 'Scene Heading',
  action: 'Action',
  character: 'Character',
  parenthetical: 'Parenthetical',
  dialogue: 'Dialogue',
  transition: 'Transition',
  shot: 'Shot',
  act_break: 'Act Break',
};

export const ELEMENT_SHORTCUTS: Record<ElementType, string> = {
  scene_heading: '⌘1',
  action: '⌘2',
  character: '⌘3',
  parenthetical: '⌘4',
  dialogue: '⌘5',
  transition: '⌘6',
  shot: '⌘7',
  act_break: '⌘8',
};

/** Title page metadata — stored alongside the script */
export interface TitlePageData {
  title: string;
  writtenBy: string;       // e.g. "Written by" / "Screenplay by" / "Story by"
  authors: string;         // author name(s)
  basedOn: string;         // "Based on the novel by …" (optional)
  draftInfo: string;       // "SECOND DRAFT – January 2025" (optional)
  contactInfo: string;     // Address / email block (bottom-left)
  copyright: string;       // "© 2025 …" (bottom-right)
}

export interface Script {
  id: string;
  title: string;
  author: string;
  format: ScriptFormat;
  content: string; // Tiptap JSON stringified
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  /** User-editable per-scene production notes, keyed by scene heading text */
  sceneBreakdowns?: Record<string, SceneBreakdownData>;
  /** Optional WGA-standard title page data */
  titlePage?: TitlePageData;
  /** Inline notes / comments keyed by commentId */
  comments?: Record<string, InlineComment>;
  /** Per-scene beat/synopsis notes keyed by scene heading text (for beat board) */
  beatNotes?: Record<string, string>;
  /** Per-scene color tags for beat board cards */
  beatColors?: Record<string, string>;
}

export interface SceneInfo {
  text: string;
  nodePos: number;
  index: number;
}

/** Page background style options */
export type PageStyle = 'plain' | 'dotted' | 'lined' | 'grid';

/** A shot or transition node nested under a scene in the sidebar */
export interface NavChild {
  type: 'shot' | 'transition';
  text: string;
  nodePos: number;
}

/** A scene heading with associated children + auto-detected cast */
export interface NavScene {
  text: string;
  nodePos: number;
  index: number;
  children: NavChild[];
  cast: string[]; // character names appearing in this scene (auto-detected)
  /** Parsed from heading: INT / EXT / INT/EXT */
  intExt: string;
  /** Parsed from heading: location portion */
  location: string;
  /** Parsed from heading: time of day (DAY, NIGHT, etc.) */
  timeOfDay: string;
}

/** User-editable production breakdown for a single scene */
export interface SceneBreakdownData {
  props: string;   // comma-separated props list
  notes: string;   // free-form production notes
}

/** An inline text annotation / comment anchored to a commentId mark */
export interface InlineComment {
  id: string;
  text: string;          // the note content
  color: string;         // highlight colour e.g. '#fef08a'
  createdAt: string;
  author?: string;
  resolved?: boolean;    // whether the comment has been marked as resolved
}

/** Per-character statistics derived from script content */
export interface CharacterStats {
  name: string;
  dialogueLines: number;
  totalWords: number;
  scenesAppeared: number;
  /** Estimated speaking time in minutes (words / 125 wpm) */
  estimatedMinutes: number;
}

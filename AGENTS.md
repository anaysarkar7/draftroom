<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# DraftRoom — Agent Knowledge Base

This document is the single source of truth for any AI agent working on DraftRoom.
Read it **before** touching any code. Every feature, data model, component, keyboard
shortcut, CSS class, store action, and file is catalogued here.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.3 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5 |
| Editor Core | Tiptap (ProseMirror) | 3.22.3 |
| State | Zustand (with localStorage persist) | 5.0.12 |
| Styling | Tailwind CSS | 4 |
| Font | Courier Prime (screenplay), Geist / Geist Mono (UI) | — |

---

## Repository Structure

```
src/
├── types/screenplay.ts           # All TS interfaces & enums (ElementType, Script, etc.)
├── extensions/
│   ├── ScreenplayElement.ts     # Tiptap block node — the core screenplay paragraph
│   ├── ScreenplayKeymap.ts      # Enter / Tab / ⌘1-8 keybindings
│   ├── DualDialogue.ts          # Dual-dialogue container + column nodes
│   └── CommentMark.ts           # Inline comment/highlight mark
├── lib/
│   ├── script-io.ts             # JSON export/import, TXT export
│   ├── fdx-import.ts            # Final Draft (.fdx) XML parser
│   ├── script-analysis.ts       # Character stats, scene heading parser
│   └── utils.ts                 # cn(), formatDate(), formatRelativeDate()
├── store/scriptStore.ts         # Zustand store + localStorage persistence
├── components/
│   ├── dashboard/
│   │   ├── NewScriptModal.tsx   # Create-script form (title, author, format)
│   │   └── ScriptCard.tsx       # Dashboard script card with menu
│   └── editor/
│       ├── ScreenplayEditor.tsx       # Tiptap wrapper, page layout, props hub
│       ├── EditorToolbar.tsx          # Top nav bar (title, format, save, all actions)
│       ├── FormattingToolbar.tsx      # Secondary bar (Bold/Italic/Colour/Highlight/Note)
│       ├── StatusBar.tsx              # Bottom bar (element type, page count, word count)
│       ├── SceneNavigator.tsx         # Left sidebar — scene list, breakdown entry
│       ├── CharacterAutocomplete.tsx  # Floating dropdown for character names + CONT'D
│       ├── ScriptAnalysisModal.tsx    # Stats modal (words, scenes, character chart)
│       ├── SceneBreakdownModal.tsx    # Per-scene props/notes modal
│       ├── CommentsPanel.tsx          # Right sidebar — active & resolved notes
│       ├── AddCommentPopover.tsx      # Floating popover to create a note
│       ├── FindReplacePanel.tsx       # Floating find/replace with element-type filter
│       ├── BeatBoard.tsx              # Full-screen index-card corkboard overlay
│       └── TitlePageEditor.tsx        # WGA-standard title page (editable inline)
└── app/
    ├── page.tsx                 # Landing / marketing page
    ├── layout.tsx               # Root layout (fonts, globals)
    ├── globals.css              # All custom CSS (elements, page styles, scene numbers…)
    ├── dashboard/page.tsx       # Script library
    └── editor/[id]/page.tsx     # Main editor page — all state lives here
```

---

## Data Models (`src/types/screenplay.ts`)

### `ElementType` (union string)
```
scene_heading | action | character | parenthetical | dialogue |
transition | shot | act_break
```

### `ScriptFormat` (union string)
```
screenplay | teleplay | stage_play | audio_drama
```

### `PageStyle` (union string)
```
plain | dotted | lined | grid
```

### `Script` (stored in Zustand)
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID |
| `title` | `string` | |
| `author` | `string` | |
| `format` | `ScriptFormat` | |
| `content` | `string` | Stringified Tiptap JSON |
| `createdAt` | `string` | ISO date |
| `updatedAt` | `string` | ISO date |
| `pageCount` | `number` | |
| `sceneBreakdowns` | `Record<string, SceneBreakdownData>` | keyed by heading text |
| `comments` | `Record<string, InlineComment>` | keyed by comment UUID |
| `titlePage` | `TitlePageData \| undefined` | |
| `beatNotes` | `Record<string, string>` | keyed by `scene-N-HEADING TEXT` |
| `beatColors` | `Record<string, string>` | keyed by `scene-N-HEADING TEXT` |

### `TitlePageData`
`title`, `writtenBy`, `authors`, `basedOn`, `draftInfo`, `contactInfo`, `copyright`

### `SceneBreakdownData`
`props` (string, comma-separated), `notes` (string)

### `InlineComment`
`id`, `text`, `color` (hex), `createdAt`, `author?`, `resolved?`

### `NavScene`
`text`, `nodePos`, `index`, `children: NavChild[]`, `cast: string[]`, `intExt`, `location`, `timeOfDay`

### `CharacterStats`
`name`, `dialogueLines`, `totalWords`, `scenesAppeared`, `estimatedMinutes`

---

## Tiptap Document Schema

```
ScreenplayDocument
└── (screenplayElement | dualDialogue)+
    screenplayElement
      attrs: { elementType: ElementType }
      content: inline text + marks
    dualDialogue
      └── dualColumn dualColumn
            └── screenplayElement+
```

### Custom Marks
- **`commentMark`** — attrs: `commentId` (string), `color` (hex). Renders as `<mark class="comment-mark" data-comment-id="..." data-comment-color="...">`

### Important Tiptap Extension Notes
- `StarterKit` configured with `document: false`, `paragraph: false`, `heading: false`, `blockquote: false`, `codeBlock: false`, `horizontalRule: false`, `bulletList/orderedList/listItem: false`, `hardBreak: false`; bold/italic/strike are **enabled**
- `TextStyle` must be imported as **named export**: `import { TextStyle } from '@tiptap/extension-text-style'`
- `Highlight` configured with `multicolor: true`

---

## Keyboard Shortcuts

### Element Type Selection
| Key | Element |
|---|---|
| `⌘/Ctrl+1` | Scene Heading |
| `⌘/Ctrl+2` | Action |
| `⌘/Ctrl+3` | Character |
| `⌘/Ctrl+4` | Parenthetical |
| `⌘/Ctrl+5` | Dialogue |
| `⌘/Ctrl+6` | Transition |
| `⌘/Ctrl+7` | Shot |
| `⌘/Ctrl+8` | Act Break |

### Navigation & Editing
| Key | Action |
|---|---|
| `Enter` | Create next element (context-aware; dialogue → character; character → dialogue; etc.) |
| `Tab` | Cycle element type (action ↔ character, dialogue ↔ parenthetical) |
| `Shift+Tab` | Reverse cycle |
| `⌘B` | Bold |
| `⌘I` | Italic |
| `⌘U` | Underline |
| `⌘Shift+D` | Insert Dual Dialogue |
| `⌘F` | Open Find panel |
| `⌘H` | Open Replace panel |
| `⌘P` | Print / Save as PDF |

### ENTER_NEXT map (in `ScreenplayKeymap.ts`)
`scene_heading → action`, `action → action`, `character → dialogue`,
`parenthetical → dialogue`, `dialogue → character`, `transition → action`,
`shot → action`, `act_break → action`

### Auto CONT'D logic
When pressing Enter from a `dialogue` element, `ScreenplayKeymap` checks the previous speaker. If the new `character` node would repeat the same name, it pre-fills `NAME (CONT'D)`.

---

## All Features

### 1. Script Element Types
Eight element types, each with distinct formatting, margins, and keyboard shortcut:
- **Scene Heading** — amber/gold, bold, underlined, uppercase, `margin-top: 2em`
- **Action** — gray, standard screenplay action block
- **Character** — blue, centered (42% left padding), uppercase, `margin-top: 1em`
- **Parenthetical** — purple, centered (32%/28%), appears between character and dialogue
- **Dialogue** — green, centered (22%/18%)
- **Transition** — red, right-aligned, uppercase
- **Shot** — orange, uppercase
- **Act Break** — cyan/teal, centered, bold, uppercase, border-top/bottom (for TV/stage)

### 2. Script Formats
Four formats selectable at creation: `screenplay`, `teleplay`, `stage_play`, `audio_drama`. Format is shown as a badge with icon in the toolbar.

### 3. Dual Dialogue
Insert two characters speaking simultaneously. `⌘Shift+D` inserts the block. Backspace on an empty block collapses it to a single action element.

### 4. Character Name Autocomplete
Floating dropdown activates when cursor is in a `character` element. Lists all unique character names from the script, sorted alphabetically. Shows a `(CONT'D)` suggestion first if the previous speaker matches. `↑↓` to navigate, `Tab` to select, `Esc` to dismiss.

### 5. Auto CONT'D Insertion
When a character continues speaking after dialogue from the same character (pressing Enter → new character element), the name is pre-filled with `NAME (CONT'D)`.

### 6. Title Page Editor
WGA-standard two-section layout: centre block (title, written by, author names, based on, draft info) and bottom bar (contact info, copyright). All fields are inline-editable textareas that auto-resize. Toggle via **Title Page** button in toolbar.

### 7. Formatting Toolbar
Secondary bar below the main toolbar:
- **Bold** (`⌘B`), **Italic** (`⌘I`), **Underline** (`⌘U`), **Strikethrough**
- **Text Color** — 12 preset swatches + custom `<input type="color">`
- **Highlight** — 9 preset colors
- **Clear Formatting** — unsets all marks on selection
- **Add Note** — opens the comment popover (only when text is selected)
- Active state synced from editor's `isActive()` / `getAttributes()`

### 8. Inline Notes / Comments
Select text → click **Add Note** (or use toolbar button):
- `AddCommentPopover` appears near selection
- Write note text, pick highlight color (6 options)
- Saves `commentMark` inline mark + stores `InlineComment` in Zustand
- View/manage all notes in `CommentsPanel` (right sidebar)
- Click a note card to scroll to its position in the editor
- Resolve (✓) or delete (🗑) individual notes
- Active comment count badge on the Notes toolbar button

### 9. Beat Board (Index Cards)
Full-screen overlay (fixed, z-50) with cork-texture background:
- Auto-extracts scenes from document JSON
- Each scene = one draggable `IndexCard` component
- Cards show: scene number, heading, INT/EXT, location, time of day, cast list
- Per-card beat/synopsis notes (click to edit inline)
- 8 card colors (default, yellow, green, blue, purple, red, orange, pink)
- Drag cards to reorder → document order updated immediately via `setContent`
- Filter input (searches headings, cast names, beat notes)
- Beat notes / colors persisted to Zustand keyed by `scene-N-HEADING TEXT`

### 10. Scene Navigator (Left Sidebar)
Collapsible sidebar listing all scene headings with:
- Scene index, INT/EXT, location, time of day
- Child elements (shots, transitions) nested underneath
- Auto-detected cast list (character names in the scene)
- Active scene highlighted based on cursor position
- Click to jump to that position in the editor
- Per-scene breakdown button (clipboard icon) → opens `SceneBreakdownModal`

### 11. Scene Breakdown Modal
Per-scene production notes overlay:
- Heading metadata chips: INT/EXT, Location, Time of Day
- Auto-detected cast list
- Props textarea (comma-separated, parsed into individual chips)
- Production Notes textarea
- Saved to `script.sceneBreakdowns[headingText]`

### 12. Script Analysis Modal
Statistics overlay with:
- Overview: Pages, Scenes, Words, Estimated Runtime (150 wpm)
- Dialogue vs. Action word split (% bars)
- Character roster table: name, lines, words, scenes, estimated speaking time (125 wpm)
- Characters sorted by dialogue lines descending

### 13. Find & Replace
Floating panel (`FindReplacePanel`, fixed top-right, z-50):
- **Find** mode: real-time match count (n / total), Prev/Next navigation
- **Replace** mode: Replace current / Replace All (reverse-order transaction)
- **Rename** tab: pre-selects Replace + filters to `character` element type
- Options: Case Sensitive, Whole Word, Element Type filter (any of the 8 types)
- Keyboard: `Enter` next, `Shift+Enter` prev, `⌘Enter` replace all, `Esc` close
- Status flash after replace: "Replaced N"
- Opens via `⌘F` / `⌘H` system shortcuts or toolbar **Find** button

### 14. Scene Numbering
CSS counter-based auto-numbering (zero JS):
- Class `show-scene-numbers` on `.screenplay-page`
- Numbers appear on **both left and right margins** of every scene heading
- Left via `::before` (`right: calc(100% + 14px)`), right via `::after` (`left: calc(100% + 14px)`)
- Counter resets at top of page div, increments once per `scene_heading` element
- Works in all 4 page styles and Night Writer dark mode
- Toggled from **View → Scene Numbers** in the toolbar

### 15. Line Numbering
Similar CSS counter on all screenplay elements:
- Class `show-line-numbers` on `.screenplay-page`
- Number appears in left margin via `::after`
- Counter: `screenplay-line`, reset in `.screenplay-content`
- Toggled from **View → Line Numbers** in the toolbar

### 16. Page Style Backgrounds
Four visual styles (disabled in Night Writer mode):
- **Plain** — white
- **Dotted** — dot-grid
- **Lined** — horizontal rules every 24px
- **Grid** — squared grid 24×24px
All four include shared repeating-gradient page-break visualisation: bottom shadow + 4px separator line + top shadow at every 1056px.

### 17. Night Writer (Dark Mode)
Class `page-dark` on `.screenplay-page`. Overrides:
- Page background: `#1a1917`
- All element colors darkened for contrast
- Act break teal accent: `#67e8f9`, `#164e63` borders
- Comment marks use border instead of background fill
- Dark-mode scene number color: `#a8a29e`

### 18. Export
| Format | Function | Notes |
|---|---|---|
| DraftRoom Backup `.json` | `exportScriptAsJSON()` in `script-io.ts` | Full fidelity, re-importable |
| Read Offline `.txt` | `exportScriptAsTxt()` in `script-io.ts` | Formatted screenplay text |
| Fountain `.fountain` | `exportAsFountain()` in `fountain-export.ts` | Standard interchange format |
| PDF | `window.print()` | Browser print dialog; `@page` CSS sets 1in/1.5in margins |

### 19. Import
| Format | Handler | Location |
|---|---|---|
| DraftRoom JSON `.json` | Validates `_draftroom` marker, imports via `importScript()` | `dashboard/page.tsx` |
| Final Draft `.fdx` | `parseFdx()` XML parser | `lib/fdx-import.ts` → `dashboard/page.tsx` |

**FDX import handles**: 15+ paragraph type mappings, bold/italic/underline/strike marks, 48-bit → 24-bit color conversion, dual-dialogue, title page extraction, screenplay vs. teleplay detection.

### 20. Auto-Save
Tiptap `onUpdate` callback debounces 800ms, then calls `updateScript(id, { content, pageCount })`. Status shown in toolbar: ✓ Saved / "Saving…"

### 21. Dashboard / Script Library
- Search scripts by title or author
- Create new script (`NewScriptModal`) with title, author, format selector
- Import via split-button dropdown (JSON or FDX)
- Script cards show format badge, title, author, page count, last updated (relative)
- Per-card menu: Export JSON, Export TXT, Delete (with confirmation dialog)

### 22. Landing Page
Marketing page at `/` with hero, feature grid, keyboard shortcuts reference, format showcase, and pricing section (free).

---

## CSS Class Reference (`globals.css`)

| Class | Purpose |
|---|---|
| `.screenplay-content` | ProseMirror root; holds `counter-reset: screenplay-line` |
| `.screenplay-element` | Every paragraph block; `position: relative`, Courier Prime 12pt |
| `.screenplay-element[data-element-type="..."]` | Per-type colour, indent, margin overrides |
| `.screenplay-element.is-empty::before` | Placeholder text via Tiptap |
| `.screenplay-page` | The white paper div; `background-color: white` |
| `.screenplay-page[data-page-style="plain\|dotted\|lined\|grid"]` | Background pattern + page-break gradient |
| `.screenplay-page.show-line-numbers` | Activates line number counters |
| `.screenplay-page.show-scene-numbers` | Activates scene number counters |
| `.screenplay-page.page-dark` | Night Writer dark theme |
| `.dual-dialogue` | Side-by-side dialogue grid (2-column) |
| `.dual-col` | One column inside dual-dialogue |
| `.comment-mark` | Inline comment highlight mark |
| `.title-page` | WGA title page layout |
| `.title-page-dark` | Dark-mode title page overrides |

---

## Zustand Store API (`src/store/scriptStore.ts`)

```ts
// Read
getScript(id: string): Script | undefined

// Write
createScript(title, format, author?): Script
importScript(payload: ScriptExportPayload, extraFields?): Script
updateScript(id, updates: Partial<Script>): void
deleteScript(id): void
updateSceneBreakdown(scriptId, sceneKey, data: SceneBreakdownData): void
updateTitlePage(scriptId, data: TitlePageData): void
addComment(scriptId, comment: InlineComment): void
updateComment(scriptId, commentId, updates: Partial<InlineComment>): void
deleteComment(scriptId, commentId): void
updateBeatNote(scriptId, sceneKey, note: string): void
updateBeatColor(scriptId, sceneKey, color: string): void
```

localStorage key: `draftroom-scripts`

---

## Page Layout Architecture

```
<div flex flex-col h-screen>
  <EditorToolbar />                   z-30 relative  (stacking context)
  <FormattingToolbar />               relative        (no z-index — must stay below toolbar)
  <div flex flex-1 overflow-hidden>
    <SceneNavigator />                left sidebar, collapsible
    <ScreenplayEditor />              flex-1, overflow-y-auto, center scroll area
      <TitlePageEditor />             optional, shown above script
      <div.screenplay-page />         w-[816px], px-[96px], pt/pb-[96px], min-h-[1056px]
        <EditorContent />             Tiptap ProseMirror
      <CharacterAutocomplete />       portal to document.body
    <CommentsPanel />                 right sidebar, toggleable (w-64)
  </div>
  <StatusBar />
</div>

<!-- Overlays (portals / fixed) -->
<FindReplacePanel />     fixed top-[90px] right-6 z-50
<AddCommentPopover />    fixed, positioned near selection, portal
<ScriptAnalysisModal />  fixed overlay
<SceneBreakdownModal />  fixed overlay
<BeatBoard />            fixed inset-0 z-50
```

### Critical z-index rules
- `EditorToolbar <header>` → `z-30 relative` — must be HIGHER than FormattingToolbar so export/view dropdowns paint above it
- `FormattingToolbar <div>` → `relative` only — NO `z-index` (adding z-index creates a stacking context that buries the dropdowns above)
- Modals / overlays → `z-50`
- Character autocomplete → `z-50` via portal to `document.body`

---

## Beat Board — Scene ID Key Format

Beat notes and colors are keyed by:
```
`scene-${1-based-index}-${headingText}`
// e.g. "scene-1-INT. COFFEE SHOP - DAY"
//      "scene-14-EXT. ROOFTOP - NIGHT"
```
This guarantees uniqueness even when two scenes have identical heading text.

---

## Page Measurement

- `PAGE_HEIGHT_PX = 1056` (US Letter, 96 dpi, 11 inches)
- `ScreenplayEditor` uses a `ResizeObserver` on the page `<div>` and computes `Math.ceil(scrollHeight / PAGE_HEIGHT_PX)`
- Page number labels are absolutely positioned at `top: i * PAGE_HEIGHT_PX + 96px` (96 = top padding)
- The CSS background-gradient page-break visualisation tiles at every 1056px

---

## FDX Import — Type Mapping (`src/lib/fdx-import.ts`)

| FDX Paragraph Type | DraftRoom ElementType |
|---|---|
| Scene Heading | scene_heading |
| Action | action |
| Character | character |
| Parenthetical | parenthetical |
| Dialogue | dialogue |
| Transition | transition |
| Shot | shot |
| Act Break | act_break |
| General, Synopsis, Note, Cast List, … | action (fallback) |

---

## Known Constraints / Gotchas

1. **TextStyle import** — must use named export: `import { TextStyle } from '@tiptap/extension-text-style'`
2. **Stacking contexts** — adding `z-index` to `FormattingToolbar` breaks the export dropdown. Keep it `relative` without `z-index`.
3. **Beat Board keys** — must use `scene-N-headingText` format; heading text alone causes duplicate-key React errors when two scenes share a heading.
4. **Replace All** — must apply ProseMirror transactions in **reverse position order** to avoid position invalidation.
5. **FDX colors** — are 48-bit (`#rrrrggggbbbb`); convert by taking chars 0-1, 4-5, 8-9 of the 12-char hex string.
6. **Page margins** — top/bottom padding is `pt-[96px] pb-[96px]` (1 inch = 96px at 96 dpi); left/right `px-[96px]`.
7. **CharacterAutocomplete / AddCommentPopover** — use `createPortal(…, document.body)` and `editor.view.coordsAtPos()` for positioning; use `onMouseDown` with `e.preventDefault()` to prevent editor blur.
8. **Print CSS** — `@media print` in `globals.css` sets `@page` margins, hides toolbar/sidebar/statusbar, removes page shadows.

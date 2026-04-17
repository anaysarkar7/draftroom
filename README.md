<div align="center">
  <img src="public/logo.svg" alt="DraftRoom Logo" width="64" height="64" />
  <h1>DraftRoom</h1>
  <p><strong>The Hollywood-standard screenwriting studio that runs entirely in your browser.</strong></p>

  <p>
    <a href="https://anaysarkar7.github.io/draftroom/">🚀 Live Demo</a> ·
    <a href="https://github.com/anaysarkar7/draftroom/issues/new?template=bug_report.md">🐛 Report Bug</a> ·
    <a href="https://github.com/anaysarkar7/draftroom/issues/new?template=feature_request.md">✨ Request Feature</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
    <img src="https://img.shields.io/badge/free-%26%20open%20source-brightgreen" alt="Free & Open Source" />
  </p>
</div>

---

## ✨ What is DraftRoom?

DraftRoom is a **free, open-source, browser-based scriptwriting tool** built for screenwriters, TV writers, playwrights, and audio drama creators. It brings Hollywood-standard formatting and production tools directly to your browser — no account, no subscription, no install required. All your scripts are stored locally in your browser.

---

## 🎬 Features

### Core Writing
| Feature | Description |
|---|---|
| **8 Element Types** | Scene Heading, Action, Character, Parenthetical, Dialogue, Transition, Shot, Act Break — each with industry-standard formatting |
| **4 Script Formats** | Screenplay, Teleplay, Stage Play, Audio Drama |
| **Auto Formatting** | Correct margins, indentation, uppercase, and spacing applied automatically |
| **Dual Dialogue** | Side-by-side dialogue for two characters speaking simultaneously (`⌘⇧D`) |
| **Auto CONT'D** | Automatically inserts `NAME (CONT'D)` when a character continues after interruption |
| **Character Autocomplete** | Floating dropdown with all character names as you type in a Character element |

### Production Tools
| Feature | Description |
|---|---|
| **Beat Board** | Full-screen corkboard with draggable index cards per scene — reorder scenes, add beat notes, color-code cards |
| **Scene Navigator** | Left sidebar with every scene heading, cast list, and one-click jump to any scene |
| **Scene Breakdown** | Per-scene production notes: props, cast, INT/EXT, location, time of day |
| **Script Analysis** | Stats overview: pages, scenes, words, runtime estimate, dialogue vs. action split, character roster |
| **Title Page Editor** | WGA-standard title page with inline-editable fields (title, authors, contact info, copyright) |
| **Inline Notes** | Select any text, add a colour-coded comment note, manage from the Comments panel |

### Writing Experience
| Feature | Description |
|---|---|
| **Find & Replace** | Floating panel with case-sensitive, whole-word, element-type filtering, and Replace All |
| **Character Rename** | Dedicated Rename tab in Find & Replace — bulk rename any character across the script |
| **Scene Numbers** | CSS-based auto-numbering on both left and right margins of every scene heading |
| **Line Numbers** | Line counter in the left margin for every screenplay element |
| **Night Writer** | Dark mode for late-night writing sessions |
| **Page Styles** | Four page backgrounds: Plain, Dotted, Lined, Grid |
| **Formatting Toolbar** | Bold, Italic, Underline, Strikethrough, Text Colour (12 presets), Highlight (9 colours), Clear Formatting |
| **Auto-Save** | Debounced 800ms auto-save to localStorage — no save button needed |

### Import / Export
| Feature | Description |
|---|---|
| **Export JSON** | Full-fidelity DraftRoom backup — re-importable |
| **Export TXT** | Clean, readable formatted screenplay text |
| **Export Fountain** | `.fountain` standard interchange format |
| **Export PDF** | Browser print dialog with WGA-standard `@page` margins |
| **Import JSON** | Restore any DraftRoom backup |
| **Import FDX** | Full Final Draft `.fdx` XML parser — preserves formatting, dual dialogue, title page |

---

## ⌨️ Keyboard Shortcuts

### Element Types
| Shortcut | Element |
|---|---|
| `⌘/Ctrl + 1` | Scene Heading |
| `⌘/Ctrl + 2` | Action |
| `⌘/Ctrl + 3` | Character |
| `⌘/Ctrl + 4` | Parenthetical |
| `⌘/Ctrl + 5` | Dialogue |
| `⌘/Ctrl + 6` | Transition |
| `⌘/Ctrl + 7` | Shot |
| `⌘/Ctrl + 8` | Act Break |

### Navigation & Editing
| Shortcut | Action |
|---|---|
| `Enter` | Smart next element (context-aware) |
| `Tab` | Cycle element type |
| `Shift + Tab` | Reverse cycle |
| `⌘B` | Bold |
| `⌘I` | Italic |
| `⌘U` | Underline |
| `⌘⇧D` | Insert Dual Dialogue |
| `⌘F` | Open Find panel |
| `⌘H` | Open Replace panel |
| `⌘P` | Print / Save as PDF |

---

## 🖥️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.3 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5 |
| Editor Core | Tiptap (ProseMirror) | 3.22.3 |
| State | Zustand (localStorage persist) | 5.0.12 |
| Styling | Tailwind CSS | 4 |
| Font | Courier Prime (screenplay), Geist (UI) | — |

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (recommended) or Node.js 18+

### Local Development

```bash
# Clone the repo
git clone https://github.com/anaysarkar7/draftroom.git
cd draftroom

# Install dependencies
bun install

# Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Deploy

```bash
# Build for production
bun run build

# Deploy to GitHub Pages
bun run deploy
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── dashboard/page.tsx        # Script library
│   └── editor/[id]/page.tsx      # Main editor
├── components/
│   ├── dashboard/                # NewScriptModal, ScriptCard
│   └── editor/                   # All editor components
├── extensions/                   # Tiptap custom extensions
├── lib/                          # Import/export utilities
├── store/scriptStore.ts          # Zustand state
└── types/screenplay.ts           # TypeScript interfaces
```

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature idea:

1. **[Open an issue](https://github.com/anaysarkar7/draftroom/issues/new)** to discuss it first
2. Fork the repository
3. Create a feature branch: `git checkout -b feat/amazing-feature`
4. Commit your changes: `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feat/amazing-feature`
6. Open a Pull Request

---

## 📄 License

MIT © [Anay Sarkar](https://github.com/anaysarkar7)

---

<div align="center">
  <p>Built with ❤️ for writers everywhere · <a href="https://anaysarkar7.github.io/draftroom/">Try it live</a></p>
</div>

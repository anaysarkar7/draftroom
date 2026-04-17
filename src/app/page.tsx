import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Tv,
  Theater,
  Mic,
  ArrowRight,
  Check,
  Keyboard,
  LayoutList,
  Download,
  Upload,
  MessageSquare,
  BarChart2,
  LayoutGrid,
  Search,
  Hash,
  Moon,
  FileSignature,
  Users,
  Columns2,
  GitFork,
  Star,
  Zap,
  BookOpen,
  Palette,
  ListOrdered,
} from "lucide-react";

// GitHub SVG mark (official icon — not in lucide-react v1.x)
function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// ─── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Film size={20} className="text-amber-400" />,
    title: "Industry-Standard Formatting",
    desc: "Automatic margins, indentation, and pagination for screenplay, teleplay, stage play, and audio drama — no config required.",
    tag: "Core",
  },
  {
    icon: <Keyboard size={20} className="text-blue-400" />,
    title: "Smart Keyboard Flow",
    desc: "Tab and Enter intelligently cycle between element types. Hit Enter after dialogue and the cursor jumps straight to the next character name.",
    tag: "Core",
  },
  {
    icon: <Users size={20} className="text-cyan-400" />,
    title: "Character Autocomplete & CONT'D",
    desc: "Floating dropdown lists every character in your script. Automatically inserts (CONT'D) when the same character speaks consecutively.",
    tag: "Smart",
  },
  {
    icon: <Columns2 size={20} className="text-violet-400" />,
    title: "Dual Dialogue",
    desc: "Insert side-by-side character exchanges with ⌘⇧D. Backspace on an empty dual block collapses it cleanly to an action line.",
    tag: "Smart",
  },
  {
    icon: <LayoutGrid size={20} className="text-amber-400" />,
    title: "Beat Board (Index Cards)",
    desc: "Full-screen corkboard with one draggable card per scene. Write beat notes, colour-code by act, and reorder scenes — document updates live.",
    tag: "Story",
  },
  {
    icon: <LayoutList size={20} className="text-green-400" />,
    title: "Scene Navigator",
    desc: "Live sidebar showing every scene with INT/EXT, location, time-of-day, and auto-detected cast. Click to jump anywhere instantly.",
    tag: "Story",
  },
  {
    icon: <ListOrdered size={20} className="text-lime-400" />,
    title: "Scene Numbering",
    desc: "One-click scene numbers on both left and right margins — the Hollywood production standard. CSS counters mean zero performance cost.",
    tag: "Story",
  },
  {
    icon: <BarChart2 size={20} className="text-rose-400" />,
    title: "Script Analysis",
    desc: "Instant stats: pages, scenes, word count, estimated runtime, dialogue-to-action ratio, and a per-character breakdown with speaking time.",
    tag: "Story",
  },
  {
    icon: <MessageSquare size={20} className="text-yellow-400" />,
    title: "Inline Notes & Comments",
    desc: "Select any text and add a colour-coded note. The Comments panel shows all active and resolved annotations with one-click scroll-to.",
    tag: "Annotate",
  },
  {
    icon: <Search size={20} className="text-sky-400" />,
    title: "Find, Replace & Character Rename",
    desc: "Case-sensitive, whole-word, and per-element-type search. The Rename tab replaces a character name across every cue in one shot.",
    tag: "Annotate",
  },
  {
    icon: <FileSignature size={20} className="text-blue-400" />,
    title: "WGA Title Page Editor",
    desc: "Inline-editable title, author, based-on, draft info, contact, and copyright — all in the exact WGA two-section layout.",
    tag: "Polish",
  },
  {
    icon: <Palette size={20} className="text-pink-400" />,
    title: "Rich Text Formatting",
    desc: "Bold, italic, underline, strikethrough, 12 text colours, 9 highlight colours, and clear-all formatting — all from the secondary toolbar.",
    tag: "Polish",
  },
  {
    icon: <Moon size={20} className="text-violet-400" />,
    title: "Night Writer (Dark Mode)",
    desc: "Easy-on-the-eyes dark theme for late-night sessions. All element colours are recalibrated for contrast on the dark page.",
    tag: "Polish",
  },
  {
    icon: <Hash size={20} className="text-gray-400" />,
    title: "Page & Line Numbers",
    desc: "Toggle line numbers and page number labels independently. Pure CSS counters — no render overhead regardless of script length.",
    tag: "Polish",
  },
  {
    icon: <Upload size={20} className="text-orange-400" />,
    title: "Final Draft FDX Import",
    desc: "Full .fdx XML parser: 15+ paragraph types, bold/italic/colour marks, dual-dialogue, title page, and auto-detection of screenplay vs. teleplay.",
    tag: "Import",
  },
  {
    icon: <Download size={20} className="text-purple-400" />,
    title: "4 Export Formats",
    desc: "DraftRoom Backup (.json), Read-Offline (.txt), Fountain (.fountain) for any professional tool, and PDF via the browser print dialog.",
    tag: "Export",
  },
  {
    icon: <BookOpen size={20} className="text-teal-400" />,
    title: "Scene Breakdown Sheets",
    desc: "Per-scene production notes: auto-parsed heading metadata, detected cast, comma-separated props list rendered as chips, and free notes.",
    tag: "Production",
  },
  {
    icon: <Zap size={20} className="text-yellow-300" />,
    title: "Auto-Save (Local Storage)",
    desc: "Every keystroke is debounced and saved to localStorage within 800 ms. No account, no server, no data ever leaves your browser.",
    tag: "Core",
  },
];

const ELEMENT_DEMO = [
  { text: "INT. COFFEE SHOP — DAY", style: "uppercase font-bold underline text-amber-900 mt-6 tracking-wide" },
  { text: "ALEX sits alone at a corner table, laptop open, staring at a blank screen.", style: "text-gray-700 mt-3" },
  { text: "BARISTA", style: "uppercase text-blue-900 font-semibold pl-[42%] mt-4" },
  { text: "(leaning in)", style: "text-purple-700 pl-[32%] pr-[28%]" },
  { text: "You've been here three hours. Can I get you anything?", style: "text-green-900 pl-[22%] pr-[18%]" },
  { text: "ALEX", style: "uppercase text-blue-900 font-semibold pl-[42%] mt-2" },
  { text: "(not looking up)", style: "text-purple-700 pl-[32%] pr-[28%]" },
  { text: "Just the wifi password. Again.", style: "text-green-900 pl-[22%] pr-[18%]" },
  { text: "CUT TO:", style: "uppercase text-red-800 text-right mt-4" },
];

const TAG_COLORS: Record<string, string> = {
  Core:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Smart:      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Story:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Annotate:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Polish:     "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Import:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Export:     "bg-green-500/10 text-green-400 border-green-500/20",
  Production: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DraftRoom" width={22} height={22} />
            <span className="font-bold text-white">DraftRoom</span>
          </div>

          <div className="flex items-center gap-1 hidden sm:flex">
            <a href="#features" className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">Features</a>
            <a href="#open-source" className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">Open Source</a>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/anaysarkar7/draftroom"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900"
            >
              <GithubIcon size={13} />
              GitHub
            </a>
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">

        {/* Open-source badge */}
        <div className="inline-flex items-center gap-2 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
          <GitFork size={11} />
          Free &amp; Open Source · No account needed · Your data stays in your browser
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
          Write like a pro.
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Ship like one too.
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          DraftRoom is a full-featured, Hollywood-standard scriptwriting studio that runs
          entirely in your browser. Beat boards, scene numbering, Final Draft import, inline
          notes, character stats — 22+ features, completely free and open source.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
          >
            Start Writing — Free
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com/anaysarkar7/draftroom"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-colors bg-gray-900"
          >
            <GithubIcon size={15} />
            View on GitHub
            <Star size={13} className="text-yellow-400" />
          </a>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
          {[
            { n: "22+", label: "Features" },
            { n: "4",   label: "Script Formats" },
            { n: "4",   label: "Export Formats" },
            { n: "0",   label: "Account Required" },
            { n: "∞",   label: "Scripts" },
          ].map(({ n, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-white">{n}</span>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Editor preview ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">

          {/* Toolbar mock */}
          <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="flex-1 text-center text-xs text-gray-600 font-medium">
              FADE_IN.fountain — DraftRoom
            </span>
            <span className="text-[10px] text-green-500/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/70 inline-block" />
              Saved
            </span>
          </div>

          {/* Formatting bar mock */}
          <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center justify-center gap-2 px-4">
            {["B", "I", "U", "S"].map((f) => (
              <span key={f} className="w-5 h-5 rounded text-[10px] font-bold text-gray-600 flex items-center justify-center border border-gray-800">{f}</span>
            ))}
            <span className="w-px h-4 bg-gray-800 mx-1" />
            {["🎨", "✏️", "🗑"].map((ic) => (
              <span key={ic} className="text-[10px] text-gray-700">{ic}</span>
            ))}
          </div>

          <div className="flex">
            {/* Scene navigator */}
            <div className="w-44 border-r border-gray-800 bg-gray-950/60 p-3 hidden sm:block shrink-0">
              <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-2 font-semibold">Scenes · 2</div>
              <div className="text-[10px] text-amber-400/90 font-mono truncate bg-gray-800/60 rounded px-1.5 py-1 mb-1">
                ① INT. COFFEE SHOP
              </div>
              <div className="text-[10px] text-gray-600 font-mono truncate px-1.5 py-1">
                ② EXT. STREET
              </div>
              <div className="mt-3 text-[9px] text-gray-700 border-t border-gray-800 pt-2">Cast: ALEX, BARISTA</div>
            </div>

            {/* Script page */}
            <div className="flex-1 bg-white px-10 py-8 min-h-[320px]">
              {/* Scene number simulation */}
              <div className="relative">
                <span className="absolute -left-6 text-[9px] text-gray-400 font-bold font-mono top-6">1</span>
                <span className="absolute -right-6 text-[9px] text-gray-400 font-bold font-mono top-6">1</span>
                <div className="font-mono text-[13px] leading-relaxed" style={{ fontFamily: "'Courier Prime', 'Courier New', Courier, monospace" }}>
                  {ELEMENT_DEMO.map((el, i) => (
                    <div key={i} className={el.style}>{el.text}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments panel mock */}
            <div className="w-40 border-l border-gray-800 bg-gray-950/60 p-2.5 hidden lg:block shrink-0">
              <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-2 font-semibold">Notes · 1</div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                <div className="w-full h-1 rounded bg-yellow-400/60 mb-1.5" />
                <div className="text-[9px] text-gray-500 leading-relaxed">Strong opener — love the wifi gag.</div>
              </div>
            </div>
          </div>

          {/* Status bar mock */}
          <div className="h-7 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-4">
            <span className="text-[9px] text-amber-400/70 font-medium">● Scene Heading</span>
            <span className="text-[9px] text-gray-700">Page 1 of 1</span>
            <span className="text-[9px] text-gray-700">34 words</span>
          </div>
        </div>
      </section>

      {/* ── Format badges ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-5 font-semibold">Supported Formats</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { icon: <Film size={13} />, label: "Screenplay",   color: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
            { icon: <Tv size={13} />,   label: "Teleplay",     color: "text-blue-400 border-blue-400/20 bg-blue-400/5" },
            { icon: <Theater size={13} />, label: "Stage Play", color: "text-purple-400 border-purple-400/20 bg-purple-400/5" },
            { icon: <Mic size={13} />,  label: "Audio Drama",  color: "text-green-400 border-green-400/20 bg-green-400/5" },
          ].map((f) => (
            <div key={f.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium ${f.color}`}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Everything a Hollywood script needs.
            <br />
            <span className="text-gray-500">In your browser.</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            From first-draft writing to production-ready breakdowns — DraftRoom covers
            the full pre-production workflow, no plugins, no subscription.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-750 transition-colors">
                  {f.icon}
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${TAG_COLORS[f.tag] ?? "bg-gray-800 text-gray-500 border-gray-700"}`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Keyboard shortcuts ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-2">Keyboard-first</p>
              <h2 className="text-2xl font-bold text-white">Flow without lifting your hands.</h2>
              <p className="text-gray-500 text-sm mt-1">Every element transition is a single keypress.</p>
            </div>
            <span className="text-[10px] text-gray-600 border border-gray-800 rounded-lg px-3 py-1.5">⌘1–⌘8 to jump to any type directly</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-0">
            {[
              ["Enter  after scene heading", "→ Action line"],
              ["Enter  after action", "→ Action line"],
              ["Tab  on action", "→ Character name"],
              ["Enter  after character", "→ Dialogue"],
              ["Tab  on dialogue", "→ Parenthetical"],
              ["Enter  after dialogue", "→ Next character"],
              ["Same character ×2", "→ Auto (CONT'D)"],
              ["⌘⇧D", "→ Dual Dialogue block"],
              ["⌘F / ⌘H", "→ Find / Replace"],
              ["⌘B · ⌘I · ⌘U", "→ Bold · Italic · Underline"],
            ].map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-gray-800/60 last:border-0">
                <span className="text-gray-400 text-sm font-mono">{key}</span>
                <span className="text-blue-400 text-sm">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Source section ──────────────────────────────────────────── */}
      <section id="open-source" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950/30 border border-gray-800 rounded-2xl p-10 sm:p-14 overflow-hidden text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
              <GitFork size={11} />
              Open Source — MIT License
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built in the open. <span className="text-blue-400">Free forever.</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed mb-10">
              DraftRoom is fully open source under the MIT license. Read the code, fork it,
              self-host it, contribute features, or just use it — no strings attached.
              Your scripts never leave your browser.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
              {[
                { icon: <Check size={14} className="text-green-400" />, text: "MIT licensed — use it anywhere" },
                { icon: <Check size={14} className="text-green-400" />, text: "No telemetry, no tracking" },
                { icon: <Check size={14} className="text-green-400" />, text: "Scripts saved locally — no server" },
                { icon: <Check size={14} className="text-green-400" />, text: "No account, no email, no paywall" },
                { icon: <Check size={14} className="text-green-400" />, text: "Self-hostable in one command" },
                { icon: <Check size={14} className="text-green-400" />, text: "PRs and issues welcome" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-300">
                  {icon} {text}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://github.com/anaysarkar7/draftroom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium px-7 py-3 rounded-xl text-sm transition-all"
              >
                <GithubIcon size={15} />
                Star on GitHub
                <Star size={13} className="text-yellow-400" />
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-7 py-3 rounded-xl text-sm transition-all"
              >
                Open the Editor
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Simple pricing.</h2>
          <p className="text-gray-500 text-sm">No tiers. No upsells. No "Pro" gate on features you already need.</p>
        </div>

        <div className="max-w-md mx-auto bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-center">
            <span className="text-white text-xs font-bold uppercase tracking-widest">Free & Open Source</span>
          </div>

          <div className="p-8">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="text-gray-500 text-sm mb-2">/ forever</span>
            </div>
            <p className="text-gray-600 text-xs mb-8">MIT licensed. Always. No hidden tiers.</p>

            <ul className="space-y-3 mb-8">
              {[
                "All 22+ features — no exceptions",
                "Unlimited scripts",
                "Screenplay, Teleplay, Stage Play, Audio Drama",
                "Beat Board & Index Cards",
                "Scene Numbers + Script Analysis",
                "Find, Replace & Character Rename",
                "Inline Notes & Comments",
                "WGA Title Page Editor",
                "Final Draft (.fdx) Import",
                "Fountain, JSON, TXT, PDF Export",
                "Night Writer dark mode",
                "Auto-save — no account needed",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={14} className="text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors"
            >
              Open DraftRoom — Free
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="DraftRoom" width={16} height={16} />
              <span className="font-bold text-white text-sm">DraftRoom</span>
              <span className="text-gray-600 text-xs ml-1">— The screenwriter&apos;s studio</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/anaysarkar7/draftroom" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                <GithubIcon size={12} /> GitHub
              </a>
              <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Dashboard</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700 border-t border-gray-800/60 pt-6">
            <span>Built with Next.js · Tiptap · Zustand · Tailwind CSS</span>
            <span>MIT License · {new Date().getFullYear()} · Free &amp; Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

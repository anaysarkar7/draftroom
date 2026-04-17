'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Upload, AlertCircle,
  ChevronDown, FileJson, FileCode2,
} from 'lucide-react';
import { useScriptStore } from '@/store/scriptStore';
import { ScriptCard } from '@/components/dashboard/ScriptCard';
import { NewScriptModal } from '@/components/dashboard/NewScriptModal';
import { parseImportedJSON } from '@/lib/script-io';
import { parseFdx } from '@/lib/fdx-import';
import type { ScriptFormat } from '@/types/screenplay';
import { cn } from '@/lib/utils';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const { scripts, createScript, deleteScript, importScript } = useScriptStore();
  const [showModal, setShowModal]         = useState(false);
  const [search, setSearch]               = useState('');
  const [importError, setImportError]     = useState<string | null>(null);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [importing, setImporting]         = useState(false);

  // Two separate hidden file inputs for the two formats
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const fdxInputRef  = useRef<HTMLInputElement>(null);

  const filtered = scripts.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (title: string, format: ScriptFormat, author: string) => {
    const script = createScript(title, format, author);
    setShowModal(false);
    router.push(`/editor/${script.id}`);
  };

  // ── JSON import ───────────────────────────────────────────────────────────
  const handleJsonFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      setImportError(null);
      setImporting(true);

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result;
        if (typeof text !== 'string') {
          setImportError('Could not read the file.');
          setImporting(false);
          return;
        }
        const payload = parseImportedJSON(text);
        if (!payload) {
          setImportError('Invalid file. Please import a .draftroom.json backup.');
          setImporting(false);
          return;
        }
        const script = importScript(payload);
        setImporting(false);
        router.push(`/editor/${script.id}`);
      };
      reader.onerror = () => {
        setImportError('Failed to read the file. Please try again.');
        setImporting(false);
      };
      reader.readAsText(file);
    },
    [importScript, router]
  );

  // ── FDX import ────────────────────────────────────────────────────────────
  const handleFdxFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      setImportError(null);
      setImporting(true);

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result;
        if (typeof text !== 'string') {
          setImportError('Could not read the file.');
          setImporting(false);
          return;
        }
        const result = parseFdx(text);
        if (!result) {
          setImportError(
            'Could not parse the Final Draft file (.fdx). ' +
            'Make sure it is a valid Final Draft 8+ script (not a template).'
          );
          setImporting(false);
          return;
        }
        // Import with the extracted title page data attached
        const script = importScript(result.payload, { titlePage: result.titlePageData });
        setImporting(false);
        router.push(`/editor/${script.id}`);
      };
      reader.onerror = () => {
        setImportError('Failed to read the file. Please try again.');
        setImporting(false);
      };
      reader.readAsText(file, 'utf-8');
    },
    [importScript, router]
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hidden file inputs */}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,.draftroom.json"
        className="hidden"
        onChange={handleJsonFile}
      />
      <input
        ref={fdxInputRef}
        type="file"
        accept=".fdx"
        className="hidden"
        onChange={handleFdxFile}
      />

      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-4 shrink-0">
            <Image src="/logo.svg" alt="DraftRoom" width={20} height={20} />
            <span className="font-bold text-white text-sm hidden xs:inline sm:inline">DraftRoom</span>
          </Link>

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-gray-600 transition-colors placeholder:text-gray-600"
            />
          </div>

          {/* ── Import split-button ─────────────────────────────────────── */}
          <div className="relative shrink-0">
            {/* Main label (clicking opens the menu) */}
            <button
              onClick={() => setImportMenuOpen((o) => !o)}
              disabled={importing}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium px-2.5 sm:px-4 py-1.5 rounded-lg transition-colors border',
                'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-gray-700',
                importing && 'opacity-60 cursor-wait'
              )}
              title="Import a script"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">{importing ? 'Importing…' : 'Import'}</span>
              <ChevronDown size={12} className={cn('opacity-60 transition-transform', importMenuOpen && 'rotate-180')} />
            </button>

            {importMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setImportMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden">

                  {/* DraftRoom JSON */}
                  <button
                    onClick={() => { setImportMenuOpen(false); jsonInputRef.current?.click(); }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors"
                  >
                    <FileJson size={16} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">DraftRoom Backup</p>
                      <p className="text-xs text-gray-500 mt-0.5">.draftroom.json — Full fidelity, all metadata</p>
                    </div>
                  </button>

                  <div className="h-px bg-gray-700 mx-3" />

                  {/* Final Draft FDX */}
                  <button
                    onClick={() => { setImportMenuOpen(false); fdxInputRef.current?.click(); }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors"
                  >
                    <FileCode2 size={16} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">Final Draft</p>
                      <p className="text-xs text-gray-500 mt-0.5">.fdx — Imports text, structure &amp; inline styles</p>
                    </div>
                  </button>

                </div>
              </>
            )}
          </div>

          <ReportIssueButton variant="icon" className="hidden sm:flex" />

          {/* New Script */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-2.5 sm:px-4 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Script</span>
          </button>
        </div>
      </header>

      {/* Import error banner */}
      {importError && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{importError}</span>
            <button
              onClick={() => setImportError(null)}
              className="ml-auto text-red-500 hover:text-red-300 text-xs underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {scripts.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-5">
              <Image src="/logo.svg" alt="DraftRoom" width={32} height={32} className="opacity-40" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No scripts yet</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs">
              Create your first script, or import from DraftRoom backup or Final Draft.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Import DraftRoom JSON */}
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors border border-gray-700"
              >
                <FileJson size={14} className="text-blue-400" />
                Import backup (.json)
              </button>

              {/* Import FDX */}
              <button
                onClick={() => fdxInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors border border-gray-700"
              >
                <FileCode2 size={14} className="text-amber-400" />
                Import Final Draft (.fdx)
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Create your first script
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg font-semibold text-white">
                {search ? `Results for "${search}"` : 'My Scripts'}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filtered.length})
                </span>
              </h1>
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-500 text-sm py-10 text-center">
                No scripts matching &ldquo;{search}&rdquo;
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onDelete={deleteScript}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <NewScriptModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}

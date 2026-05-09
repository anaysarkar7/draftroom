'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Tv,
  Theater,
  Mic,
  MoreVertical,
  Trash2,
  FileText,
  Clock,
  FileJson,
  Download,
} from 'lucide-react';
import type { Script, ScriptFormat } from '@/types/screenplay';
import { FORMAT_LABELS } from '@/types/screenplay';
import { formatRelativeDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { exportScriptAsJSON, exportScriptAsTxt } from '@/lib/script-io';

const FORMAT_ICONS: Record<ScriptFormat, React.ReactNode> = {
  screenplay: <Film size={13} />,
  teleplay: <Tv size={13} />,
  stage_play: <Theater size={13} />,
  audio_drama: <Mic size={13} />,
};

const FORMAT_COLORS: Record<ScriptFormat, string> = {
  screenplay: 'text-amber-400 bg-amber-400/10',
  teleplay: 'text-blue-400 bg-blue-400/10',
  stage_play: 'text-purple-400 bg-purple-400/10',
  audio_drama: 'text-green-400 bg-green-400/10',
};

interface ScriptCardProps {
  script: Script;
  onDelete: (id: string) => void;
}

export function ScriptCard({ script, onDelete }: ScriptCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(script.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleExportJson = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    exportScriptAsJSON(script);
    setMenuOpen(false);
  };

  const handleExportTxt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    exportScriptAsTxt(script);
    setMenuOpen(false);
  };

  return (
    <div className="group relative bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-black/20">
      {/* Card header - clickable */}
      <Link href={`/editor/${script.id}`} className="block p-5">
        {/* Format badge */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mb-3',
            FORMAT_COLORS[script.format]
          )}
        >
          {FORMAT_ICONS[script.format]}
          {FORMAT_LABELS[script.format]}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-base mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
          {script.title}
        </h3>

        {/* Author */}
        {script.author && (
          <p className="text-gray-500 text-xs mb-3">by {script.author}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mt-4 pt-4 border-t border-gray-800">
          <span className="flex items-center gap-1">
            <FileText size={11} />
            {script.pageCount} {script.pageCount === 1 ? 'page' : 'pages'}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={11} />
            {formatRelativeDate(script.updatedAt)}
          </span>
        </div>
      </Link>

      {/* Menu button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((o) => !o);
          }}
          className="p-1.5 text-gray-600 hover:text-gray-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all rounded hover:bg-gray-800"
        >
          <MoreVertical size={14} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">

              {/* Export section */}
              <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                Export
              </p>

              <button
                onClick={handleExportJson}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
              >
                <FileJson size={12} className="text-blue-400" />
                Backup (.json)
              </button>

              <button
                onClick={handleExportTxt}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
              >
                <Download size={12} className="text-green-400" />
                Read offline (.txt)
              </button>

              <div className="h-px bg-gray-700 mx-2 my-1" />

              {/* Delete */}
              <button
                onClick={handleDelete}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                  confirmDelete
                    ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-red-400'
                )}
              >
                <Trash2 size={12} />
                {confirmDelete ? 'Click to confirm' : 'Delete script'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

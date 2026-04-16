'use client';

/**
 * TitlePageEditor
 * ───────────────
 * Renders a WGA-standard title page as a physical "page" rendered before the
 * script content.  Every field is directly inline-editable — just click and type.
 *
 * Layout (WGA standard):
 *   ┌─────────────────────────────────────┐
 *   │                                     │
 *   │                                     │
 *   │          TITLE (centered)           │
 *   │                                     │
 *   │          Written by                 │
 *   │          Author Name(s)             │
 *   │                                     │
 *   │          Based on… (optional)       │
 *   │                                     │
 *   │          DRAFT INFO (optional)      │
 *   │                                     │
 *   │                                     │
 *   │ Contact info        © Copyright     │
 *   └─────────────────────────────────────┘
 */

import { useCallback, useRef } from 'react';
import type { TitlePageData } from '@/types/screenplay';
import { cn } from '@/lib/utils';

interface Props {
  data: TitlePageData;
  onChange: (data: TitlePageData) => void;
  darkMode?: boolean;
}

// Auto-resize a textarea to its content
function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

// Tiny inline editable textarea that auto-expands
function EditableField({
  value,
  onChange,
  placeholder,
  className,
  rows = 1,
  autoUpper = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  rows?: number;
  autoUpper?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = autoUpper ? e.target.value.toUpperCase() : e.target.value;
      onChange(v);
      autoResize(e.target);
    },
    [onChange, autoUpper]
  );

  return (
    <div className="title-page__field-wrapper w-full">
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        spellCheck
        className={cn('w-full overflow-hidden', className)}
        style={{ resize: 'none' }}
        onFocus={(e) => autoResize(e.target)}
      />
    </div>
  );
}

export function TitlePageEditor({ data, onChange, darkMode = false }: Props) {
  const set = useCallback(
    (key: keyof TitlePageData) => (value: string) =>
      onChange({ ...data, [key]: value }),
    [data, onChange]
  );

  return (
    <div
      className={cn(
        'title-page shadow-2xl',
        darkMode && 'title-page-dark'
      )}
    >
      {/* ── Centre block ─────────────────────────────────────────────── */}
      <div className="title-page__center">

        {/* Title */}
        <div className="title-page__field-wrapper w-full text-center mb-6">
          <EditableField
            value={data.title}
            onChange={set('title')}
            placeholder="TITLE OF YOUR SCRIPT"
            className="title-page__title"
            autoUpper
          />
          <p className="title-page__field-hint">Script title</p>
        </div>

        {/* Written by line */}
        <div className="title-page__field-wrapper w-full text-center mb-0.5">
          <EditableField
            value={data.writtenBy}
            onChange={set('writtenBy')}
            placeholder="Written by"
            className="title-page__written-by"
          />
          <p className="title-page__field-hint">Credit line</p>
        </div>

        {/* Author name(s) */}
        <div className="title-page__field-wrapper w-full text-center">
          <EditableField
            value={data.authors}
            onChange={set('authors')}
            placeholder="Your Name"
            className="title-page__authors"
          />
          <p className="title-page__field-hint">Author name(s)</p>
        </div>

        {/* Based on */}
        {(data.basedOn !== undefined) && (
          <div className="title-page__field-wrapper w-full text-center mt-4">
            <EditableField
              value={data.basedOn}
              onChange={set('basedOn')}
              placeholder={'Based on the novel \u201cTitle\u201d by Author (optional)'}
              className="title-page__based-on"
              rows={2}
            />
            <p className="title-page__field-hint">Source material (optional)</p>
          </div>
        )}

        {/* Draft info */}
        <div className="title-page__field-wrapper w-full text-center mt-8">
          <EditableField
            value={data.draftInfo}
            onChange={set('draftInfo')}
            placeholder="FIRST DRAFT — Month Year (optional)"
            className="title-page__draft-info"
          />
          <p className="title-page__field-hint">Draft / revision info (optional)</p>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className="title-page__bottom">
        {/* Contact info — bottom left */}
        <div className="title-page__field-wrapper">
          <textarea
            rows={4}
            value={data.contactInfo}
            onChange={(e) => set('contactInfo')(e.target.value)}
            placeholder={"Your Name\nyour@email.com\n+1 (555) 000-0000"}
            spellCheck={false}
            className="title-page__contact"
            style={{ resize: 'none' }}
          />
          <p className="title-page__field-hint">Contact info</p>
        </div>

        {/* Copyright — bottom right */}
        <div className="title-page__field-wrapper text-right">
          <textarea
            rows={2}
            value={data.copyright}
            onChange={(e) => set('copyright')(e.target.value)}
            placeholder={'© 2025 Your Name\nAll rights reserved.'}
            spellCheck={false}
            className="title-page__copyright"
            style={{ resize: 'none' }}
          />
          <p className="title-page__field-hint text-right">Copyright</p>
        </div>
      </div>

      {/* ── Edit hint banner ─────────────────────────────────────────── */}
      <div className="absolute top-3 right-3">
        <span className="text-[9px] font-medium text-blue-400/60 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full select-none">
          Click any field to edit
        </span>
      </div>
    </div>
  );
}

/** Returns a sensible default TitlePageData seeded from the script metadata */
export function defaultTitlePage(title: string, author: string): TitlePageData {
  const year = new Date().getFullYear();
  return {
    title: title.toUpperCase(),
    writtenBy: 'Written by',
    authors: author,
    basedOn: '',
    draftInfo: '',
    contactInfo: '',
    copyright: `© ${year} ${author}`,
  };
}

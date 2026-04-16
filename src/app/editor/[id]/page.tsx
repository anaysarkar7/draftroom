// Server component — required to export generateStaticParams for static export.
// Script IDs are runtime UUIDs in localStorage so there's nothing to pre-render;
// returning [] satisfies Next.js while all actual logic stays client-side.
import EditorClient from './EditorClient';

// Next.js 16 requires prerenderedRoutes.length > 0 — returning [] triggers the
// same "missing generateStaticParams" error as not exporting it at all.
// We return one placeholder slug so the build succeeds; all real navigation is
// client-side (Next.js router), and page-refresh deep-links are recovered by
// public/404.html → sessionStorage SPA redirect trick.
export function generateStaticParams() {
  return [{ id: 'editor' }];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: PageProps) {
  return <EditorClient params={params} />;
}

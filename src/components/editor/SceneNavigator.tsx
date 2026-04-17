'use client';

import { useEffect, useState } from 'react';
import { LayoutList, ChevronLeft, ChevronRight, Clapperboard, Scissors, ClipboardList } from 'lucide-react';
import type { Editor } from '@tiptap/core';
import type { NavScene } from '@/types/screenplay';
import { parseSceneHeading } from '@/lib/script-analysis';
import { cn } from '@/lib/utils';

interface SceneNavigatorProps {
  editor: Editor | null;
  onOpenBreakdown?: (scene: NavScene) => void;
}

export function SceneNavigator({ editor, onOpenBreakdown }: SceneNavigatorProps) {
  const [scenes, setScenes] = useState<NavScene[]>([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  // Extract scenes (children + cast) from the document
  useEffect(() => {
    if (!editor) return;

    const extractScenes = () => {
      const result: NavScene[] = [];
      let current: NavScene | null = null;

      editor.state.doc.forEach((node, offset) => {
        // Handle top-level screenplayElement nodes
        if (node.type.name === 'screenplayElement') {
          const type = node.attrs.elementType as string;
          const text = node.textContent?.trim() ?? '';

          if (type === 'scene_heading') {
            const parsed = parseSceneHeading(text || '');
            current = {
              text: text || `Scene ${result.length + 1}`,
              nodePos: offset,
              index: result.length,
              children: [],
              cast: [],
              intExt: parsed.intExt,
              location: parsed.location,
              timeOfDay: parsed.timeOfDay,
            };
            result.push(current);
          } else if ((type === 'shot' || type === 'transition') && current && text) {
            current.children.push({ type: type as 'shot' | 'transition', text, nodePos: offset });
          } else if (type === 'character' && current && text) {
            const name = text.toUpperCase().replace(/\s*\(.*?\)\s*$/, '').trim();
            if (name && !current.cast.includes(name)) {
              current.cast.push(name);
            }
          }
        }

        // Handle dualDialogue nodes — extract characters from both columns
        if (node.type.name === 'dualDialogue' && current) {
          node.forEach((col) => {
            col.forEach((el) => {
              if (el.type.name === 'screenplayElement' && el.attrs.elementType === 'character') {
                const name = (el.textContent?.trim() ?? '')
                  .toUpperCase()
                  .replace(/\s*\(.*?\)\s*$/, '')
                  .trim();
                if (name && !current!.cast.includes(name)) {
                  current!.cast.push(name);
                }
              }
            });
          });
        }
      });

      setScenes(result);
    };

    extractScenes();
    editor.on('update', extractScenes);
    return () => { editor.off('update', extractScenes); };
  }, [editor]);

  // Track active scene based on cursor position
  useEffect(() => {
    if (!editor) return;

    const trackActive = () => {
      const { pos } = editor.state.selection.$from;
      let active = 0;
      scenes.forEach((scene, i) => {
        if (scene.nodePos <= pos) active = i;
      });
      setActiveSceneIndex(active);
    };

    editor.on('selectionUpdate', trackActive);
    return () => { editor.off('selectionUpdate', trackActive); };
  }, [editor, scenes]);

  const jumpTo = (nodePos: number) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(nodePos + 1).run();
  };

  const totalChildren = scenes.reduce((n, s) => n + s.children.length, 0);

  return (
    <aside
      className={cn(
        'relative bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-hidden transition-all duration-200',
        // On mobile: fully hidden when collapsed, visible when open
        // On desktop (md+): collapsed shows as w-9 icon strip
        isOpen ? 'w-56' : 'w-0 border-r-0 md:w-9 md:border-r'
      )}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-800 shrink-0">
        {isOpen && (
          <>
            <LayoutList size={13} className="text-gray-500 shrink-0 ml-2" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
              Scenes
            </span>
            <span className="ml-auto text-[10px] text-gray-600 shrink-0 tabular-nums">
              {scenes.length}
              {totalChildren > 0 && (
                <span className="text-gray-700"> +{totalChildren}</span>
              )}
            </span>
          </>
        )}

        <button
          onClick={() => setIsOpen((o) => !o)}
          className={cn(
            'flex items-center justify-center rounded p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors shrink-0',
            !isOpen && 'mx-auto'
          )}
          title={isOpen ? 'Collapse scene list' : 'Expand scene list'}
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Scene list */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto py-1.5">
          {scenes.length === 0 ? (
            <p className="text-xs text-gray-600 px-4 py-3 italic">
              No scene headings yet.
            </p>
          ) : (
            scenes.map((scene) => (
              <div key={scene.nodePos}>
                {/* Scene heading row */}
                <div
                  className={cn(
                    'flex items-center gap-1 pr-1 transition-colors',
                    activeSceneIndex === scene.index
                      ? 'bg-gray-800/60'
                      : 'hover:bg-gray-800/40'
                  )}
                >
                  <button
                    onClick={() => jumpTo(scene.nodePos)}
                    title={scene.text}
                    className={cn(
                      'flex-1 min-w-0 text-left px-3 py-1.5 text-xs flex items-center gap-2',
                      activeSceneIndex === scene.index ? 'text-amber-400' : 'text-gray-400'
                    )}
                  >
                    {/* Scene number badge */}
                    <span
                      className={cn(
                        'shrink-0 text-[9px] font-bold w-4 h-4 rounded flex items-center justify-center',
                        activeSceneIndex === scene.index
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-gray-800 text-gray-600'
                      )}
                    >
                      {scene.index + 1}
                    </span>
                    {/* Scene name — truncated, full text in title tooltip */}
                    <span className="block truncate font-mono leading-snug flex-1 min-w-0">
                      {scene.text}
                    </span>
                  </button>

                  {/* Breakdown button */}
                  {onOpenBreakdown && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenBreakdown(scene); }}
                      title="Scene breakdown"
                      className="shrink-0 p-1 rounded text-gray-600 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                    >
                      <ClipboardList size={11} />
                    </button>
                  )}
                </div>

                {/* Cast chips — shown when scene is active */}
                {activeSceneIndex === scene.index && scene.cast.length > 0 && (
                  <div className="px-3 pb-1.5 flex flex-wrap gap-1">
                    {scene.cast.map((name) => (
                      <span
                        key={name}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-blue-900/30 text-blue-400/80 border border-blue-800/30 truncate max-w-[80px]"
                        title={name}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Children: shots and transitions */}
                {scene.children.map((child) => (
                  <button
                    key={child.nodePos}
                    onClick={() => jumpTo(child.nodePos)}
                    title={child.text}
                    className="w-full text-left pl-8 pr-3 py-1 text-[10px] flex items-center gap-1.5 transition-colors hover:bg-gray-800/60 group"
                  >
                    {child.type === 'shot' ? (
                      <Clapperboard size={9} className="shrink-0 text-orange-500/70 group-hover:text-orange-400" />
                    ) : (
                      <Scissors size={9} className="shrink-0 text-rose-500/70 group-hover:text-rose-400" />
                    )}
                    <span
                      className={cn(
                        'block truncate font-mono leading-snug min-w-0',
                        child.type === 'shot'
                          ? 'text-orange-600/80 group-hover:text-orange-500'
                          : 'text-rose-600/80 group-hover:text-rose-500'
                      )}
                    >
                      {child.text}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Collapsed state — show scene count */}
      {!isOpen && scenes.length > 0 && (
        <div className="flex flex-col items-center pt-3 gap-1">
          <span className="text-[10px] text-gray-600 font-mono">{scenes.length}</span>
        </div>
      )}
    </aside>
  );
}

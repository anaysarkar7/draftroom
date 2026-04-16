import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Script, ScriptFormat, SceneBreakdownData, TitlePageData, InlineComment } from '@/types/screenplay';
import type { ScriptExportPayload } from '@/lib/script-io';

const DEFAULT_CONTENT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'screenplayElement',
      attrs: { elementType: 'scene_heading' },
      content: [],
    },
  ],
});

interface ScriptState {
  scripts: Script[];
  createScript: (title: string, format: ScriptFormat, author?: string) => Script;
  importScript: (payload: ScriptExportPayload, extraFields?: Partial<Omit<Script, 'id' | 'createdAt' | 'format' | 'content'>>) => Script;
  updateScript: (id: string, updates: Partial<Omit<Script, 'id' | 'createdAt'>>) => void;
  deleteScript: (id: string) => void;
  getScript: (id: string) => Script | undefined;
  updateSceneBreakdown: (scriptId: string, sceneKey: string, data: SceneBreakdownData) => void;
  updateTitlePage: (scriptId: string, data: TitlePageData) => void;
  addComment: (scriptId: string, comment: InlineComment) => void;
  updateComment: (scriptId: string, commentId: string, updates: Partial<InlineComment>) => void;
  deleteComment: (scriptId: string, commentId: string) => void;
  updateBeatNote: (scriptId: string, sceneKey: string, note: string) => void;
  updateBeatColor: (scriptId: string, sceneKey: string, color: string) => void;
}

export const useScriptStore = create<ScriptState>()(
  persist(
    (set, get) => ({
      scripts: [],

      createScript: (title, format, author = '') => {
        const now = new Date().toISOString();
        const script: Script = {
          id: crypto.randomUUID(),
          title: title.trim() || 'Untitled Script',
          author,
          format,
          content: DEFAULT_CONTENT,
          createdAt: now,
          updatedAt: now,
          pageCount: 1,
        };
        set((s) => ({ scripts: [script, ...s.scripts] }));
        return script;
      },

      importScript: (payload, extraFields?) => {
        const now = new Date().toISOString();
        const script: Script = {
          id: crypto.randomUUID(),
          title: payload.title?.trim() || 'Untitled Script',
          author: payload.author ?? '',
          format: payload.format as ScriptFormat,
          content: payload.content,
          createdAt: payload.createdAt ?? now,
          updatedAt: now,
          pageCount: payload.pageCount ?? 1,
          ...extraFields,
        };
        set((s) => ({ scripts: [script, ...s.scripts] }));
        return script;
      },

      updateScript: (id, updates) => {
        set((s) => ({
          scripts: s.scripts.map((script) =>
            script.id === id
              ? { ...script, ...updates, updatedAt: new Date().toISOString() }
              : script
          ),
        }));
      },

      deleteScript: (id) => {
        set((s) => ({ scripts: s.scripts.filter((script) => script.id !== id) }));
      },

      getScript: (id) => get().scripts.find((s) => s.id === id),

      updateSceneBreakdown: (scriptId, sceneKey, data) => {
        set((s) => ({
          scripts: s.scripts.map((script) =>
            script.id === scriptId
              ? {
                  ...script,
                  sceneBreakdowns: { ...(script.sceneBreakdowns ?? {}), [sceneKey]: data },
                  updatedAt: new Date().toISOString(),
                }
              : script
          ),
        }));
      },

      updateTitlePage: (scriptId, data) => {
        set((s) => ({
          scripts: s.scripts.map((script) =>
            script.id === scriptId
              ? { ...script, titlePage: data, updatedAt: new Date().toISOString() }
              : script
          ),
        }));
      },

      addComment: (scriptId, comment) => {
        set((s) => ({
          scripts: s.scripts.map((script) =>
            script.id === scriptId
              ? {
                  ...script,
                  comments: { ...(script.comments ?? {}), [comment.id]: comment },
                  updatedAt: new Date().toISOString(),
                }
              : script
          ),
        }));
      },

      updateComment: (scriptId, commentId, updates) => {
        set((s) => ({
          scripts: s.scripts.map((script) => {
            if (script.id !== scriptId || !script.comments?.[commentId]) return script;
            return {
              ...script,
              comments: {
                ...script.comments,
                [commentId]: { ...script.comments[commentId], ...updates },
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      deleteComment: (scriptId, commentId) => {
        set((s) => ({
          scripts: s.scripts.map((script) => {
            if (script.id !== scriptId) return script;
            const comments = { ...(script.comments ?? {}) };
            delete comments[commentId];
            return { ...script, comments, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      updateBeatNote: (scriptId, sceneKey, note) => {
        set((s) => ({
          scripts: s.scripts.map((script) =>
            script.id === scriptId
              ? {
                  ...script,
                  beatNotes: { ...(script.beatNotes ?? {}), [sceneKey]: note },
                  updatedAt: new Date().toISOString(),
                }
              : script
          ),
        }));
      },

      updateBeatColor: (scriptId, sceneKey, color) => {
        set((s) => ({
          scripts: s.scripts.map((script) =>
            script.id === scriptId
              ? {
                  ...script,
                  beatColors: { ...(script.beatColors ?? {}), [sceneKey]: color },
                  updatedAt: new Date().toISOString(),
                }
              : script
          ),
        }));
      },
    }),
    { name: 'draftroom-scripts' }
  )
);

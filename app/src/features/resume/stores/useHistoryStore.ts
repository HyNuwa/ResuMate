import { create } from 'zustand';

const MAX_HISTORY = 30;

export interface HistoryState<T> {
  past: T[];
  future: T[];
  pushHistory: (snapshot: T) => void;
  undo: () => T | undefined;
  redo: () => T | undefined;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

/**
 * Creates a history slice that can be merged into any Zustand store.
 * Usage:
 *   const useStore = create<State & HistoryState<MyState>>((set, get) => ({
 *     ...createHistorySlice<MyState>(set, get),
 *     // ... rest of store
 *   }))
 */
export function createHistorySlice<T>(
  set: (fn: (s: { past: T[]; future: T[] }) => Partial<{ past: T[]; future: T[] }>) => void,
  get: () => { past: T[]; future: T[] },
): Pick<HistoryState<T>, 'past' | 'future' | 'pushHistory' | 'undo' | 'redo' | 'canUndo' | 'canRedo' | 'clear'> {
  return {
    past: [],
    future: [],

    pushHistory: (snapshot: T) =>
      set((s) => ({
        past: [...s.past, snapshot].slice(-MAX_HISTORY),
        future: [],
      })),

    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return undefined;
      const previous = past[past.length - 1]!;
      set(() => ({
        past: past.slice(0, -1),
        future: [previous, ...future].slice(0, MAX_HISTORY),
      }));
      return previous;
    },

    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return undefined;
      const next = future[0]!;
      set(() => ({
        past: [...past, next].slice(-MAX_HISTORY),
        future: future.slice(1),
      }));
      return next;
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    clear: () => set(() => ({ past: [], future: [] })),
  };
}

/**
 * Standalone undo/redo store for editor-level history.
 * Use this when the history scope is broader than a single data slice.
 */
export interface EditorHistoryState {
  snapshots: string[];   // JSON-serialized ResumeData snapshots
  index: number;
  push: (snapshot: string) => void;
  undo: () => string | undefined;
  redo: () => string | undefined;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useEditorHistoryStore = create<EditorHistoryState>((set, get) => ({
  snapshots: [],
  index: -1,

  push: (snapshot: string) =>
    set((s) => {
      const newSnapshots = [...s.snapshots.slice(0, s.index + 1), snapshot].slice(-MAX_HISTORY);
      return { snapshots: newSnapshots, index: newSnapshots.length - 1 };
    }),

  undo: () => {
    const { snapshots, index } = get();
    if (index <= 0) return undefined;
    set({ index: index - 1 });
    return snapshots[index - 1];
  },

  redo: () => {
    const { snapshots, index } = get();
    if (index >= snapshots.length - 1) return undefined;
    set({ index: index + 1 });
    return snapshots[index + 1];
  },

  canUndo: () => get().index > 0,
  canRedo: () => get().index < get().snapshots.length - 1,
}));

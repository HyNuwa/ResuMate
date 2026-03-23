import { create } from 'zustand';

export type EditorPanel = 'sections' | 'preview' | 'settings';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface EditorState {
  // Panel visibility
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;

  // Active panel
  activePanel: EditorPanel;

  // Zoom
  zoom: number;  // 0.5 = 50%, 1 = 100%

  // Save status
  saveStatus: SaveStatus;

  // Dirty flag (unsaved changes)
  isDirty: boolean;

  // Active section being edited
  activeSectionId: string | null;

  // Actions
  setLeftPanelOpen:  (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setActivePanel:    (panel: EditorPanel) => void;
  setZoom:           (zoom: number) => void;
  setSaveStatus:     (status: SaveStatus) => void;
  setDirty:          (dirty: boolean) => void;
  setActiveSectionId: (id: string | null) => void;
  reset:             () => void;
}

const initialState = {
  leftPanelOpen:  true,
  rightPanelOpen: true,
  activePanel: 'sections' as EditorPanel,
  zoom: 1,
  saveStatus: 'idle' as SaveStatus,
  isDirty: false,
  activeSectionId: null,
};

export const useEditorStore = create<EditorState>()((set) => ({
  ...initialState,

  setLeftPanelOpen:  (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setActivePanel:    (panel) => set({ activePanel: panel }),
  setZoom:           (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  setSaveStatus:     (status) => set({ saveStatus: status }),
  setDirty:          (dirty) => set({ isDirty: dirty }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),
  reset:             () => set(initialState),
}));

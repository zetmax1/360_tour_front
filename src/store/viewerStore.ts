import { create } from 'zustand';

interface HistoryEntry {
  sceneId: string;
  arrivedViaLinkId: string | null;
}

interface ViewerStore {
  currentSceneId: string | null;
  yaw: number;
  pitch: number;
  hfov: number;

  history: HistoryEntry[];
  incomingLinkId: string | null;
  previousSceneId: string | null;

  setScene: (sceneId: string, arrivedViaLinkId?: string | null) => void;
  setViewAngles: (yaw: number, pitch: number) => void;
  setHfov: (hfov: number) => void;
  reset: () => void;
  clearHistory: () => void;
}

export const useViewerStore = create<ViewerStore>()((set) => ({
  currentSceneId: null,
  yaw: 0,
  pitch: 0,
  hfov: 100,

  history: [],
  incomingLinkId: null,
  previousSceneId: null,

  setScene: (sceneId, arrivedViaLinkId = null) => {
    set((state) => {
      const newEntry: HistoryEntry = { sceneId, arrivedViaLinkId };
      const newHistory = [...state.history, newEntry];
      const previousSceneId = newHistory.length >= 2
        ? newHistory[newHistory.length - 2].sceneId
        : null;

      return {
        currentSceneId: sceneId,
        history: newHistory,
        incomingLinkId: arrivedViaLinkId,
        previousSceneId,
      };
    });
  },
  setViewAngles: (yaw, pitch) => set({ yaw, pitch }),
  setHfov: (hfov) => set({ hfov }),
  reset: () => set({ currentSceneId: null, yaw: 0, pitch: 0, hfov: 100, history: [], incomingLinkId: null, previousSceneId: null }),
  clearHistory: () => set({ history: [], incomingLinkId: null, previousSceneId: null }),
}));

import { create } from 'zustand';
import type { Anchor } from '../api/anchors';

interface State {
  anchors: Anchor[];
  setAnchors: (data: Anchor[]) => void;
}

export const useAnchorsStore = create<State>((set) => ({
  anchors: [],
  setAnchors: (data) => set({ anchors: data })
}));

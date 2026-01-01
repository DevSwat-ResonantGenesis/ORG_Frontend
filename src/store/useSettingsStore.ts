import { create } from 'zustand';
import type { Thresholds } from '../api/settings';

interface State {
  thresholds: Thresholds;
  setThresholds: (data: Thresholds) => void;
}

const defaults: Thresholds = { validity: 0.8, entropy: 0.4, anchor_prob: 0.6, anchorProb: 0.6 };

export const useSettingsStore = create<State>((set) => ({
  thresholds: defaults,
  setThresholds: (data) => set({ thresholds: data })
}));

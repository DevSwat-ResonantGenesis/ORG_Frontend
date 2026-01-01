import { create } from 'zustand';
import type { Prediction } from '../api/predictions';
import { fetchPredictions } from '../api/predictions';

interface State {
  items: Prediction[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const usePredictionsStore = create<State>((set) => ({
  items: [],
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchPredictions();
      set({ items: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error?.message || 'Failed to load predictions' });
    }
  }
}));

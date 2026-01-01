import { create } from 'zustand';
import type { Policy } from '../api/policies';

interface State {
  policies: Policy[];
  setPolicies: (data: Policy[]) => void;
}

export const usePoliciesStore = create<State>((set) => ({
  policies: [],
  setPolicies: (data) => set({ policies: data })
}));

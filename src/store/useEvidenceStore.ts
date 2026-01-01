import { create } from 'zustand';

interface Node {
  id: string;
  label: string;
  cluster: string;
}

interface State {
  nodes: Node[];
  setNodes: (data: Node[]) => void;
}

export const useEvidenceStore = create<State>((set) => ({
  nodes: [],
  setNodes: (data) => set({ nodes: data })
}));

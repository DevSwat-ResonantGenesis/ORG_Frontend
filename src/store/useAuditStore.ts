import { create } from 'zustand';
import type { AuditLog } from '../api/audit';

interface State {
  logs: AuditLog[];
  setLogs: (data: AuditLog[]) => void;
}

export const useAuditStore = create<State>((set) => ({
  logs: [],
  setLogs: (data) => set({ logs: data })
}));

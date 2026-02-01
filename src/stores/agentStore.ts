import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Agent, AgentConfig } from '../types';

// ============== AGENT DOMAIN STORE ==============

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  selectAgent: (id: string | null) => void;
  startAgent: (id: string) => void;
  stopAgent: (id: string) => void;
  pauseAgent: (id: string) => void;
  resumeAgent: (id: string) => void;
  archiveAgent: (id: string) => void;
  forkAgent: (id: string, newName: string) => void;
  updateAgentConfig: (id: string, config: Partial<AgentConfig>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: Pick<AgentState, 'agents' | 'selectedAgentId' | 'loading' | 'error'> = {
  agents: [],
  selectedAgentId: null,
  loading: false,
  error: null,
};

export const useAgentStore = create<AgentState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setAgents: (agents: Agent[]) => set({ agents }),
      
      addAgent: (agent: Agent) => set((state) => ({ 
        agents: [...state.agents, agent] 
      })),
      
      updateAgent: (id: string, updates: Partial<Agent>) => set((state) => ({
        agents: state.agents.map((a: Agent) => 
          a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
        )
      })),
      
      removeAgent: (id: string) => set((state) => ({
        agents: state.agents.filter((a: Agent) => a.id !== id),
        selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId
      })),
      
      selectAgent: (id: string | null) => set({ selectedAgentId: id }),
      
      startAgent: (id: string) => set((state) => ({
        agents: state.agents.map((a: Agent) => 
          a.id === id && (a.status === 'idle' || a.status === 'paused')
            ? { ...a, status: 'active' as const, updatedAt: new Date() }
            : a
        )
      })),
      
      stopAgent: (id: string) => set((state) => ({
        agents: state.agents.map((a: Agent) => 
          a.id === id && a.status === 'active'
            ? { ...a, status: 'idle' as const, updatedAt: new Date() }
            : a
        )
      })),
      
      pauseAgent: (id: string) => set((state) => ({
        agents: state.agents.map((a: Agent) => 
          a.id === id && a.status === 'active'
            ? { ...a, status: 'paused' as const, updatedAt: new Date() }
            : a
        )
      })),
      
      resumeAgent: (id: string) => set((state) => ({
        agents: state.agents.map((a: Agent) => 
          a.id === id && a.status === 'paused'
            ? { ...a, status: 'active' as const, updatedAt: new Date() }
            : a
        )
      })),
      
      archiveAgent: (id: string) => set((state) => ({
        agents: state.agents.map((a: Agent) => 
          a.id === id ? { ...a, status: 'archived' as const, updatedAt: new Date() } : a
        )
      })),
      
      forkAgent: (id: string, newName: string) => set((state) => {
        const agent = state.agents.find((a: Agent) => a.id === id);
        if (!agent) return state;
        const forkedAgent: Agent = {
          ...agent,
          id: `agent-${Date.now()}`,
          hash: `0x${Date.now().toString(16)}`,
          persisted: false,
          name: newName,
          status: 'idle',
          version: '1.0.0',
          executions: 0,
          costToday: 0,
          pendingApprovals: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return { agents: [...state.agents, forkedAgent] };
      }),
      
      updateAgentConfig: (id: string, config: Partial<AgentConfig>) => set((state) => ({
        agents: state.agents.map((a: Agent) => 
          a.id === id ? { ...a, config: { ...a.config, ...config }, updatedAt: new Date() } : a
        )
      })),
      
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'AgentStore' }
  )
);

// Selectors for optimized re-renders
export const selectAgents = (state: AgentState) => state.agents;
export const selectSelectedAgent = (state: AgentState) => 
  state.agents.find((a: Agent) => a.id === state.selectedAgentId) || null;
export const selectActiveAgents = (state: AgentState) => 
  state.agents.filter((a: Agent) => a.status === 'active');
export const selectAgentById = (id: string) => (state: AgentState) => 
  state.agents.find((a: Agent) => a.id === id);

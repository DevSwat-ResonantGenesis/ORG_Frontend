import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowVariable, WorkflowTrigger, WorkflowStatus } from '../types';

// ============== WORKFLOW DOMAIN STORE ==============

interface WorkflowState {
  workflows: Workflow[];
  selectedWorkflowId: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  removeWorkflow: (id: string) => void;
  selectWorkflow: (id: string | null) => void;
  
  // Node/Edge Actions
  addNode: (workflowId: string, node: WorkflowNode) => void;
  updateNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  removeNode: (workflowId: string, nodeId: string) => void;
  addEdge: (workflowId: string, edge: WorkflowEdge) => void;
  removeEdge: (workflowId: string, edgeId: string) => void;
  
  // Lifecycle Actions
  validateWorkflow: (id: string) => boolean;
  publishWorkflow: (id: string) => void;
  deprecateWorkflow: (id: string) => void;
  versionBump: (id: string, newVersion: string) => void;
  
  // Loading States
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: Pick<WorkflowState, 'workflows' | 'selectedWorkflowId' | 'loading' | 'error'> = {
  workflows: [],
  selectedWorkflowId: null,
  loading: false,
  error: null,
};

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
        ...initialState,
        
        setWorkflows: (workflows: Workflow[]) => set({ workflows }),
        
        addWorkflow: (workflow: Workflow) => set((state) => ({
          workflows: [...state.workflows, workflow]
        })),
        
        updateWorkflow: (id: string, updates: Partial<Workflow>) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
          )
        })),
        
        removeWorkflow: (id: string) => set((state) => ({
          workflows: state.workflows.filter((w: Workflow) => w.id !== id),
          selectedWorkflowId: state.selectedWorkflowId === id ? null : state.selectedWorkflowId
        })),
        
        selectWorkflow: (id: string | null) => set({ selectedWorkflowId: id }),
        
        addNode: (workflowId: string, node: WorkflowNode) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === workflowId 
              ? { ...w, nodes: [...w.nodes, node], updatedAt: new Date() }
              : w
          )
        })),
        
        updateNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.map((n: WorkflowNode) =>
                    n.id === nodeId ? { ...n, ...updates } : n
                  ),
                  updatedAt: new Date()
                }
              : w
          )
        })),
        
        removeNode: (workflowId: string, nodeId: string) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.filter((n: WorkflowNode) => n.id !== nodeId),
                  edges: w.edges.filter((e: WorkflowEdge) => e.source !== nodeId && e.target !== nodeId),
                  updatedAt: new Date()
                }
              : w
          )
        })),
        
        addEdge: (workflowId: string, edge: WorkflowEdge) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === workflowId
              ? { ...w, edges: [...w.edges, edge], updatedAt: new Date() }
              : w
          )
        })),
        
        removeEdge: (workflowId: string, edgeId: string) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === workflowId
              ? { ...w, edges: w.edges.filter((e: WorkflowEdge) => e.id !== edgeId), updatedAt: new Date() }
              : w
          )
        })),
        
        validateWorkflow: (id: string) => {
          const workflow = get().workflows.find((w: Workflow) => w.id === id);
          if (!workflow) return false;
          
          // Basic validation: must have start and end nodes
          const hasStart = workflow.nodes.some((n: WorkflowNode) => n.type === 'start');
          const hasEnd = workflow.nodes.some((n: WorkflowNode) => n.type === 'end');
          
          if (hasStart && hasEnd) {
            set((state) => ({
              workflows: state.workflows.map((w: Workflow) =>
                w.id === id ? { ...w, status: 'validated' as WorkflowStatus, updatedAt: new Date() } : w
              )
            }));
            return true;
          }
          return false;
        },
        
        publishWorkflow: (id: string) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === id && w.status === 'validated'
              ? { ...w, status: 'published' as WorkflowStatus, publishedAt: new Date(), updatedAt: new Date() }
              : w
          )
        })),
        
        deprecateWorkflow: (id: string) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === id ? { ...w, status: 'deprecated' as WorkflowStatus, updatedAt: new Date() } : w
          )
        })),
        
        versionBump: (id: string, newVersion: string) => set((state) => ({
          workflows: state.workflows.map((w: Workflow) =>
            w.id === id ? { ...w, version: newVersion, updatedAt: new Date() } : w
          )
        })),
        
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),
        reset: () => set(initialState),
      }),
    { name: 'WorkflowStore' }
  )
);

// Selectors
export const selectWorkflows = (state: WorkflowState) => state.workflows;
export const selectSelectedWorkflow = (state: WorkflowState) =>
  state.workflows.find((w: Workflow) => w.id === state.selectedWorkflowId) || null;
export const selectPublishedWorkflows = (state: WorkflowState) =>
  state.workflows.filter((w: Workflow) => w.status === 'published');

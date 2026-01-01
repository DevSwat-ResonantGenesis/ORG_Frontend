import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { NetworkConnection, ProtocolConfig, WebhookConfig, ConnectionStatus } from '../types';

// ============== NETWORK DOMAIN STORE ==============

interface NetworkState {
  connections: NetworkConnection[];
  protocols: ProtocolConfig[];
  webhooks: WebhookConfig[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setConnections: (connections: NetworkConnection[]) => void;
  addConnection: (connection: NetworkConnection) => void;
  updateConnection: (id: string, updates: Partial<NetworkConnection>) => void;
  removeConnection: (id: string) => void;
  
  setProtocols: (protocols: ProtocolConfig[]) => void;
  updateProtocol: (id: string, updates: Partial<ProtocolConfig>) => void;
  toggleProtocol: (id: string) => void;
  
  setWebhooks: (webhooks: WebhookConfig[]) => void;
  addWebhook: (webhook: WebhookConfig) => void;
  updateWebhook: (id: string, updates: Partial<WebhookConfig>) => void;
  removeWebhook: (id: string) => void;
  toggleWebhook: (id: string) => void;
  
  // Connection Actions
  connect: (id: string) => void;
  disconnect: (id: string) => void;
  
  // Loading States
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: Pick<NetworkState, 'connections' | 'protocols' | 'webhooks' | 'loading' | 'error'> = {
  connections: [],
  protocols: [],
  webhooks: [],
  loading: false,
  error: null,
};

export const useNetworkStore = create<NetworkState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setConnections: (connections: NetworkConnection[]) => set({ connections }),
      
      addConnection: (connection: NetworkConnection) => set((state) => ({
        connections: [...state.connections, connection]
      })),
      
      updateConnection: (id: string, updates: Partial<NetworkConnection>) => set((state) => ({
        connections: state.connections.map((c: NetworkConnection) =>
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      
      removeConnection: (id: string) => set((state) => ({
        connections: state.connections.filter((c: NetworkConnection) => c.id !== id)
      })),
      
      setProtocols: (protocols: ProtocolConfig[]) => set({ protocols }),
      
      updateProtocol: (id: string, updates: Partial<ProtocolConfig>) => set((state) => ({
        protocols: state.protocols.map((p: ProtocolConfig) =>
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      toggleProtocol: (id: string) => set((state) => ({
        protocols: state.protocols.map((p: ProtocolConfig) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p
        )
      })),
      
      setWebhooks: (webhooks: WebhookConfig[]) => set({ webhooks }),
      
      addWebhook: (webhook: WebhookConfig) => set((state) => ({
        webhooks: [...state.webhooks, webhook]
      })),
      
      updateWebhook: (id: string, updates: Partial<WebhookConfig>) => set((state) => ({
        webhooks: state.webhooks.map((w: WebhookConfig) =>
          w.id === id ? { ...w, ...updates } : w
        )
      })),
      
      removeWebhook: (id: string) => set((state) => ({
        webhooks: state.webhooks.filter((w: WebhookConfig) => w.id !== id)
      })),
      
      toggleWebhook: (id: string) => set((state) => ({
        webhooks: state.webhooks.map((w: WebhookConfig) =>
          w.id === id ? { ...w, enabled: !w.enabled } : w
        )
      })),
      
      connect: (id: string) => set((state) => ({
        connections: state.connections.map((c: NetworkConnection) =>
          c.id === id ? { ...c, status: 'connecting' as ConnectionStatus } : c
        )
      })),
      
      disconnect: (id: string) => set((state) => ({
        connections: state.connections.map((c: NetworkConnection) =>
          c.id === id ? { ...c, status: 'disconnected' as ConnectionStatus } : c
        )
      })),
      
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'NetworkStore' }
  )
);

// Selectors
export const selectConnections = (state: NetworkState) => state.connections;
export const selectActiveConnections = (state: NetworkState) =>
  state.connections.filter((c: NetworkConnection) => c.status === 'connected');
export const selectProtocols = (state: NetworkState) => state.protocols;
export const selectWebhooks = (state: NetworkState) => state.webhooks;

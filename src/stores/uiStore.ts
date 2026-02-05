import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SidebarSection } from '../types';

// ============== UI DOMAIN STORE ==============
// View state only - no business logic

interface UIState {
  activeSection: SidebarSection;
  selectedAgentId: string | null;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  pinnedAgentIds: string[];
  theme: 'dark' | 'light';
  searchQuery: string;
  filters: Record<string, unknown>;
  sortOrder: Record<string, 'asc' | 'desc'>;
  
  // Actions
  setActiveSection: (section: SidebarSection) => void;
  setSelectedAgentId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setPinnedAgentIds: (ids: string[]) => void;
  togglePinnedAgent: (agentId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  setSortOrder: (key: string, order: 'asc' | 'desc') => void;
  reset: () => void;
}

const PINNED_AGENT_IDS_KEY = 'agentos:pinnedAgentIds';

const loadPinnedAgentIds = (): string[] => {
  try {
    const raw = localStorage.getItem(PINNED_AGENT_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

const savePinnedAgentIds = (ids: string[]) => {
  try {
    localStorage.setItem(PINNED_AGENT_IDS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
};

const initialState: Pick<UIState, 'activeSection' | 'selectedAgentId' | 'sidebarCollapsed' | 'commandPaletteOpen' | 'pinnedAgentIds' | 'theme' | 'searchQuery' | 'filters' | 'sortOrder'> = {
  activeSection: 'agents',
  selectedAgentId: null,
  sidebarCollapsed: true,
  commandPaletteOpen: false,
  pinnedAgentIds: loadPinnedAgentIds(),
  theme: 'dark',
  searchQuery: '',
  filters: {},
  sortOrder: {},
};

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
        ...initialState,
        
        setActiveSection: (section: SidebarSection) => set({ activeSection: section }),
        
        setSelectedAgentId: (id: string | null) => set({ selectedAgentId: id }),
        
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
        setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
        
        toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
        
        setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

        setPinnedAgentIds: (ids: string[]) => {
          const clean = (Array.isArray(ids) ? ids : []).filter((x) => typeof x === 'string');
          savePinnedAgentIds(clean);
          set({ pinnedAgentIds: clean });
        },

        togglePinnedAgent: (agentId: string) => set((state) => {
          const current = new Set(state.pinnedAgentIds || []);
          if (current.has(agentId)) current.delete(agentId);
          else current.add(agentId);
          const next = Array.from(current);
          savePinnedAgentIds(next);
          return { pinnedAgentIds: next };
        }),
        
        setTheme: (theme: 'dark' | 'light') => set({ theme }),
        
        toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        
        setSearchQuery: (query: string) => set({ searchQuery: query }),
        
        setFilter: (key: string, value: unknown) => set((state) => ({
          filters: { ...state.filters, [key]: value }
        })),
        
        clearFilters: () => set({ filters: {} }),
        
        setSortOrder: (key: string, order: 'asc' | 'desc') => set((state) => ({
          sortOrder: { ...state.sortOrder, [key]: order }
        })),
        
        reset: () => set(initialState),
      }),
    { name: 'UIStore' }
  )
);

// Selectors
export const selectActiveSection = (state: UIState) => state.activeSection;
export const selectTheme = (state: UIState) => state.theme;
export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;

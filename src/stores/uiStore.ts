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
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  setSortOrder: (key: string, order: 'asc' | 'desc') => void;
  reset: () => void;
}

const initialState: Pick<UIState, 'activeSection' | 'selectedAgentId' | 'sidebarCollapsed' | 'commandPaletteOpen' | 'theme' | 'searchQuery' | 'filters' | 'sortOrder'> = {
  activeSection: 'agents',
  selectedAgentId: null,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
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

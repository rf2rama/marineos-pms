import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  searchQuery: string;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  searchQuery: '',
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTheme: (theme) => set({ theme }),
}));

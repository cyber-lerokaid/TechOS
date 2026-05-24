import { create } from 'zustand';

interface UIState {
  isCommandPaletteOpen: boolean;
  visualDensity: 'comfortable' | 'compact';
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setVisualDensity: (density: 'comfortable' | 'compact') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCommandPaletteOpen: false,
  visualDensity: 'comfortable',
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setVisualDensity: (density) => set({ visualDensity: density }),
}));

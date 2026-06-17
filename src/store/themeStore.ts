import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  mode: 'day' | 'night';
  toggleTheme: () => void;
  setTheme: (mode: 'day' | 'night') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'day',
      toggleTheme: () =>
        set((state) => ({ mode: state.mode === 'day' ? 'night' : 'day' })),
      setTheme: (mode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

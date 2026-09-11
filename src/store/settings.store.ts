import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { type Accent, type DiffMode, type FontFamily, type Theme } from '@/types/settings'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { DEFAULT_ACCENT } from '@/constants/accents'
import { DEFAULT_FONT } from '@/constants/fonts'
import { migrateSettings, SETTINGS_VERSION } from '@/store/migrations'

export interface SettingsState {
  theme: Theme
  accent: Accent
  font: FontFamily
  diffMode: DiffMode
  setTheme: (theme: Theme) => void
  setAccent: (accent: Accent) => void
  setFont: (font: FontFamily) => void
  setDiffMode: (mode: DiffMode) => void
}

export const DEFAULT_SETTINGS = {
  theme: 'system' as Theme,
  accent: DEFAULT_ACCENT,
  font: DEFAULT_FONT,
  diffMode: 'split' as DiffMode,
}

/**
 * settings are tiny and read by the pre-hydration script in index.html, so they are written
 * synchronously to localStorage (no debounce) — the shape `{ state: { theme, accent, font } }` must stay stable.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setFont: (font) => set({ font }),
      setDiffMode: (diffMode) => set({ diffMode }),
    }),
    {
      name: STORAGE_KEYS.settings,
      version: SETTINGS_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, accent: s.accent, font: s.font, diffMode: s.diffMode }),
      migrate: migrateSettings,
    },
  ),
)

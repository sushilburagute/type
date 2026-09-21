import { type ResolvedTheme, type Theme } from '@/types/settings'

export interface ThemeOption {
  id: Theme
  label: string
}

export const THEMES: readonly ThemeOption[] = [
  { id: 'system', label: 'system' },
  { id: 'light', label: 'light' },
  { id: 'dark', label: 'dark' },
  { id: 'dark-modern', label: 'dark modern' },
  { id: 'light-modern', label: 'light modern' },
  { id: 'monokai', label: 'monokai' },
  { id: 'solarized-dark', label: 'solarized dark' },
  { id: 'quiet-light', label: 'quiet light' },
  { id: 'abyss', label: 'abyss' },
]

const DARK_THEMES = new Set<ResolvedTheme>(['dark', 'dark-modern', 'monokai', 'solarized-dark', 'abyss'])

export function isDarkTheme(theme: ResolvedTheme): boolean {
  return DARK_THEMES.has(theme)
}

import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settings.store'
import { PREFERS_DARK, useMediaQuery } from '@/hooks/useMediaQuery'
import { type ResolvedTheme, type Theme } from '@/types/settings'

export function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
}

/**
 * mirrors settings onto <html data-theme|accent|font>. the pre-hydration script in index.html
 * already set these before first paint; this keeps them in sync afterwards.
 */
export function useTheme(): { theme: Theme; resolved: ResolvedTheme } {
  const theme = useSettingsStore((s) => s.theme)
  const accent = useSettingsStore((s) => s.accent)
  const font = useSettingsStore((s) => s.font)
  const systemDark = useMediaQuery(PREFERS_DARK)
  const resolved = resolveTheme(theme, systemDark)

  useEffect(() => {
    const d = document.documentElement.dataset
    d.theme = resolved
    d.accent = accent
    d.font = font
  }, [resolved, accent, font])

  return { theme, resolved }
}

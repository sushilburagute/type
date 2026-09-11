import { type MouseEvent } from 'react'
import { useSettingsStore } from '@/store/settings.store'
import { useTheme } from '@/hooks/useTheme'
import { runViewTransition } from '@/hooks/useViewTransition'
import { IconButton } from '@/components/ui/IconButton'
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons'
import { type Theme } from '@/types/settings'

const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
const ICON = { system: MonitorIcon, light: SunIcon, dark: MoonIcon }

/** cycles system → light → dark. the switch is a circular reveal from the button. */
export function ThemeToggle() {
  const { theme } = useTheme()
  const setTheme = useSettingsStore((s) => s.setTheme)

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    runViewTransition(() => setTheme(NEXT[theme]), { x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }

  return (
    <IconButton icon={ICON[theme]} label={`theme: ${theme}`} onClick={onClick} data-theme-value={theme} />
  )
}

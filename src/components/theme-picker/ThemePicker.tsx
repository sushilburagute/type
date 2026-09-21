import { type ChangeEvent } from 'react'
import { THEMES } from '@/constants/themes'
import { useSettingsStore } from '@/store/settings.store'
import { runViewTransition } from '@/hooks/useViewTransition'
import { useTheme } from '@/hooks/useTheme'
import { type Theme } from '@/types/settings'

/** named picker so the larger palette stays discoverable and keyboard accessible. */
export function ThemePicker() {
  const { theme } = useTheme()
  const setTheme = useSettingsStore((s) => s.setTheme)

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const select = e.currentTarget
    const next = select.value as Theme
    const r = select.getBoundingClientRect()
    runViewTransition(() => setTheme(next), { x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }

  return (
    <label className="flex items-center justify-between gap-4 text-xs font-bold text-muted">
      theme
      <select
        aria-label="theme"
        value={theme}
        onChange={onChange}
        data-theme-value={theme}
        className="h-8 min-w-36 rounded-md border border-line bg-surface-2 px-2 text-xs font-bold text-fg outline-none"
      >
        {THEMES.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

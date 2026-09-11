import { useEffect } from 'react'
import { useEditorsStore } from '@/store/editors.store'
import { useSettingsStore } from '@/store/settings.store'
import { useUiStore } from '@/store/ui.store'
import { isModPressed } from '@/utils/platform'
import { copyText } from '@/utils/clipboard'
import { flushInput } from '@/hooks/useEditorContent'
import { runViewTransition } from '@/hooks/useViewTransition'
import { track } from '@/utils/analytics'

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable
}

export function toggleTheme(origin?: { x: number; y: number }): void {
  const { theme, setTheme } = useSettingsStore.getState()
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  runViewTransition(() => setTheme(isDark ? 'light' : 'dark'), origin)
}

/** the single keydown handler for the app. exported for tests. */
export function handleShortcut(e: KeyboardEvent): void {
  const ui = useUiStore.getState()
  const editors = useEditorsStore.getState()
  const key = e.key.toLowerCase()
  const mod = isModPressed(e)
  const inEditable = isEditable(e.target)

  if (key === 'escape') {
    if (ui.paletteOpen || ui.compareOpen || ui.shortcutsOpen) {
      e.preventDefault()
      ui.closeOverlays()
    }
    return
  }

  if (key === '?' && !mod && !e.altKey && !inEditable) {
    e.preventDefault()
    ui.setShortcutsOpen(!ui.shortcutsOpen)
    return
  }

  if (e.altKey && !mod && /^[1-8]$/.test(key)) {
    const id = editors.order[Number(key) - 1]
    if (id) {
      e.preventDefault()
      editors.setActive(id)
      ui.requestFocus(id)
    }
    return
  }

  if (!mod) return

  if (key === 'k' && !e.shiftKey) {
    e.preventDefault()
    ui.setPaletteOpen(!ui.paletteOpen)
    return
  }
  if (key === '/' && !e.shiftKey) {
    e.preventDefault()
    toggleTheme()
    return
  }

  if (!e.shiftKey) return
  const active = editors.activeEditorId

  switch (key) {
    case 'n': {
      e.preventDefault()
      const id = editors.addEditor()
      if (id) ui.requestFocus(id)
      return
    }
    case 'w': {
      if (!active) return
      e.preventDefault()
      if (editors.order.length < 2) return
      flushInput(active)
      const hasText = (useEditorsStore.getState().editors[active]?.content ?? '').trim().length > 0
      if (hasText && !window.confirm('close this editor? its text will be lost.')) return
      editors.removeEditor(active)
      return
    }
    case 'c': {
      if (!active) return
      e.preventDefault()
      flushInput(active)
      const content = useEditorsStore.getState().editors[active]?.content ?? ''
      void copyText(content).then((ok) => {
        ui.pushToast(ok ? 'copied' : 'could not copy')
        if (ok) track('copy', { via: 'shortcut' })
      })
      return
    }
    case 'd': {
      if (editors.order.length < 2) return
      e.preventDefault()
      flushInput()
      ui.setCompare(active ?? editors.order[0] ?? null, null)
      ui.setCompareOpen(true)
      return
    }
    case 'u':
    case 'l':
    case 't':
    case 'j': {
      if (!active) return
      const formatId = { u: 'uppercase', l: 'lowercase', t: 'title-case', j: 'json-pretty' }[key]!
      e.preventDefault()
      flushInput(active)
      if (editors.applyFormat(active, formatId)) track('format', { id: formatId, via: 'shortcut' })
      return
    }
  }
}

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])
}

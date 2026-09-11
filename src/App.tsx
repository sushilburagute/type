import { useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ensureFontLoaded } from '@/hooks/useFontLoader'
import { initAnalyticsLazily } from '@/utils/analytics'
import { editorsStorage } from '@/store/editors.store'
import { useSettingsStore } from '@/store/settings.store'
import { flushInput } from '@/hooks/useEditorContent'
import { AppShell } from '@/components/app-shell/AppShell'

/** warms the lazy chunks once the user has started typing, so overlays open instantly later */
function prefetchOverlays(): () => void {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (conn?.saveData) return () => undefined
  let idleHandle: number | undefined
  const run = () => {
    void import('@/components/command-palette/CommandPalette')
    void import('@/components/compare/CompareView')
  }
  const schedule = () => {
    idleHandle = window.requestIdleCallback ? window.requestIdleCallback(run) : window.setTimeout(run, 1500)
  }
  window.addEventListener('keydown', schedule, { once: true, passive: true })
  return () => {
    window.removeEventListener('keydown', schedule)
    if (idleHandle === undefined) return
    if (window.cancelIdleCallback) window.cancelIdleCallback(idleHandle)
    else window.clearTimeout(idleHandle)
  }
}

export default function App() {
  useTheme()
  useKeyboardShortcuts()
  useEffect(() => {
    initAnalyticsLazily()
    void ensureFontLoaded(useSettingsStore.getState().font)
    const stopPrefetch = prefetchOverlays()
    const flushForPageExit = () => {
      flushInput()
      editorsStorage.flush()
    }
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') flushForPageExit()
    }
    document.addEventListener('visibilitychange', flushWhenHidden, { capture: true })
    window.addEventListener('pagehide', flushForPageExit, { capture: true })
    return () => {
      stopPrefetch()
      document.removeEventListener('visibilitychange', flushWhenHidden, { capture: true })
      window.removeEventListener('pagehide', flushForPageExit, { capture: true })
    }
  }, [])
  return <AppShell />
}

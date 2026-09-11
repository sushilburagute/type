import { lazy, Suspense } from 'react'
import { useUiStore } from '@/store/ui.store'
import { TopBar } from '@/components/top-bar/TopBar'
import { Workspace } from '@/components/workspace/Workspace'
import { Footer } from '@/components/footer/Footer'
import { ToastHost } from '@/components/toast/ToastHost'

// overlays are code-split: nothing here loads until the user asks for it
const CommandPalette = lazy(() => import('@/components/command-palette/CommandPalette'))
const CompareView = lazy(() => import('@/components/compare/CompareView'))
const KeyboardShortcutsSheet = lazy(() => import('@/components/shortcuts-sheet/KeyboardShortcutsSheet'))

export function AppShell() {
  const paletteOpen = useUiStore((s) => s.paletteOpen)
  const compareOpen = useUiStore((s) => s.compareOpen)
  const shortcutsOpen = useUiStore((s) => s.shortcutsOpen)

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <TopBar />
      <Workspace />
      <Footer />
      <ToastHost />
      <Suspense fallback={null}>
        {paletteOpen && <CommandPalette />}
        {compareOpen && <CompareView />}
        {shortcutsOpen && <KeyboardShortcutsSheet />}
      </Suspense>
    </div>
  )
}

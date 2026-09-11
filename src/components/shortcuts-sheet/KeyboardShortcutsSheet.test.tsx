import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import KeyboardShortcutsSheet from '@/components/shortcuts-sheet/KeyboardShortcutsSheet'
import { SHORTCUTS } from '@/constants/shortcuts'
import { useUiStore } from '@/store/ui.store'
import { renderApp, resetStores } from '@/test/render'

describe('keyboard shortcuts sheet', () => {
  beforeEach(() => {
    resetStores()
    useUiStore.getState().setShortcutsOpen(true)
  })

  it('lists every configured shortcut and closes from the dialog backdrop', () => {
    renderApp(<KeyboardShortcutsSheet />)

    for (const shortcut of SHORTCUTS) {
      expect(screen.getByText(shortcut.label)).toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole('dialog', { name: 'keyboard shortcuts' }))
    expect(useUiStore.getState().shortcutsOpen).toBe(false)
  })
})

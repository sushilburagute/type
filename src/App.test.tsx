import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { useEditorsStore } from '@/store/editors.store'
import { useUiStore } from '@/store/ui.store'
import { renderApp, resetStores } from '@/test/render'

describe('application keyboard shortcuts', () => {
  beforeEach(() => resetStores())

  it('flushes pending input before formatting and can create and compare editors', () => {
    renderApp(<App />)
    const first = useEditorsStore.getState().order[0]!
    const textarea = screen.getByRole('textbox', { name: 'untitled' })

    fireEvent.input(textarea, { target: { value: 'mixed Case' } })
    fireEvent.keyDown(textarea, { key: 'u', ctrlKey: true, shiftKey: true })

    expect(useEditorsStore.getState().editors[first]?.content).toBe('MIXED CASE')
    expect(textarea).toHaveValue('MIXED CASE')

    fireEvent.keyDown(textarea, { key: 'n', ctrlKey: true, shiftKey: true })
    expect(useEditorsStore.getState().order).toHaveLength(2)

    fireEvent.keyDown(window, { key: 'd', ctrlKey: true, shiftKey: true })
    expect(useUiStore.getState().compareOpen).toBe(true)
  })

  it('opens the command palette and shortcut sheet, then escape closes overlays', () => {
    renderApp(<App />)

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(useUiStore.getState().paletteOpen).toBe(true)

    fireEvent.keyDown(window, { key: '?' })
    expect(useUiStore.getState().shortcutsOpen).toBe(true)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useUiStore.getState().paletteOpen).toBe(false)
    expect(useUiStore.getState().shortcutsOpen).toBe(false)
  })
})

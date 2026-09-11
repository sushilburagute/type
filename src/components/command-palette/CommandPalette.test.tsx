import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CommandPalette from '@/components/command-palette/CommandPalette'
import { useEditorsStore } from '@/store/editors.store'
import { useUiStore } from '@/store/ui.store'
import { renderApp, resetStores } from '@/test/render'

describe('command palette', () => {
  beforeEach(() => {
    resetStores()
    Element.prototype.scrollIntoView = vi.fn()
    useUiStore.getState().setPaletteOpen(true)
  })

  it('filters commands and runs the selected format with the keyboard', () => {
    const id = useEditorsStore.getState().order[0]!
    useEditorsStore.getState().replaceContent(id, 'mixed Case')
    renderApp(<CommandPalette />)

    const search = screen.getByRole('combobox', { name: 'search commands' })
    fireEvent.change(search, { target: { value: 'uppercase' } })

    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.keyDown(search, { key: 'Enter' })

    expect(useEditorsStore.getState().editors[id]?.content).toBe('MIXED CASE')
    expect(useUiStore.getState().paletteOpen).toBe(false)
  })

  it('supports keyword search and reports an empty result', () => {
    renderApp(<CommandPalette />)
    const search = screen.getByRole('combobox', { name: 'search commands' })

    fireEvent.change(search, { target: { value: 'git' } })
    expect(screen.getByRole('option', { name: /compare editors/i })).toBeInTheDocument()

    fireEvent.change(search, { target: { value: 'definitely missing' } })
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('nothing matches')).toBeInTheDocument()
  })
})

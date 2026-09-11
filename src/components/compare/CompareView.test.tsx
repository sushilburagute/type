import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import CompareView from '@/components/compare/CompareView'
import { createEditorDoc, useEditorsStore } from '@/store/editors.store'
import { useSettingsStore } from '@/store/settings.store'
import { useUiStore } from '@/store/ui.store'
import { renderApp, resetStores } from '@/test/render'

describe('compare view', () => {
  beforeEach(() => {
    resetStores()
    const first = createEditorDoc({ title: 'before', content: 'same\nold' })
    const second = createEditorDoc({ title: 'after', content: 'same\nnew' })
    useEditorsStore.setState({
      editors: { [first.id]: first, [second.id]: second },
      order: [first.id, second.id],
      activeEditorId: first.id,
    })
    useUiStore.getState().setCompareOpen(true)
  })

  it('renders a split diff and switches to unified mode', () => {
    renderApp(<CompareView />)

    expect(screen.getByTestId('diff-view')).toHaveAttribute('data-mode', 'split')
    expect(screen.getByText('+1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: 'unified' }))

    expect(screen.getByTestId('diff-view')).toHaveAttribute('data-mode', 'unified')
    expect(useSettingsStore.getState().diffMode).toBe('unified')
  })

  it('swaps editor selections and closes the overlay', () => {
    const [first, second] = useEditorsStore.getState().order
    renderApp(<CompareView />)

    expect(screen.getByRole('combobox', { name: 'editor a' })).toHaveValue(first)
    expect(screen.getByRole('combobox', { name: 'editor b' })).toHaveValue(second)

    fireEvent.click(screen.getByRole('button', { name: 'swap' }))
    expect(screen.getByRole('combobox', { name: 'editor a' })).toHaveValue(second)
    expect(screen.getByRole('combobox', { name: 'editor b' })).toHaveValue(first)

    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(useUiStore.getState().compareOpen).toBe(false)
  })
})

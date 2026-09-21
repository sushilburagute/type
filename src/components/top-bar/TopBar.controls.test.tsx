import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { _resetFontLoaderForTests } from '@/hooks/useFontLoader'
import { TopBar } from '@/components/top-bar/TopBar'
import { useEditorsStore } from '@/store/editors.store'
import { useSettingsStore } from '@/store/settings.store'
import { renderApp, resetStores } from '@/test/render'

describe('top bar appearance controls', () => {
  beforeEach(() => {
    resetStores()
    _resetFontLoaderForTests()
  })

  it('selects editor-inspired themes and switches the accent reflected on the document', async () => {
    renderApp(<TopBar />)
    fireEvent.click(screen.getByRole('button', { name: 'menu' }))

    const theme = screen.getByRole('combobox', { name: 'theme', hidden: true })
    fireEvent.change(theme, { target: { value: 'dark-modern' } })
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark-modern'))
    expect(document.documentElement).toHaveAttribute('data-color-scheme', 'dark')
    expect(useSettingsStore.getState().theme).toBe('dark-modern')

    fireEvent.change(theme, { target: { value: 'quiet-light' } })
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'quiet-light'))
    expect(document.documentElement).toHaveAttribute('data-color-scheme', 'light')

    fireEvent.click(screen.getByRole('radio', { name: 'red', hidden: true }))
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-accent', 'red'))
    expect(screen.getByRole('radio', { name: 'red', hidden: true })).toBeChecked()
  })

  it('clears every open editor after confirmation', () => {
    const first = useEditorsStore.getState().order[0]!
    const second = useEditorsStore.getState().addEditor({ content: 'second' })!
    useEditorsStore.getState().setContent(first, 'first')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp(<TopBar />)

    fireEvent.click(screen.getByRole('button', { name: 'clear all editors' }))

    expect(window.confirm).toHaveBeenCalledWith('clear all open editors? all text will be lost.')
    expect(useEditorsStore.getState().editors[first]?.content).toBe('')
    expect(useEditorsStore.getState().editors[second]?.content).toBe('')
  })

  it('loads and selects each non-default editor font', async () => {
    renderApp(<TopBar />)
    fireEvent.click(screen.getByRole('button', { name: 'menu' }))

    fireEvent.click(screen.getByRole('radio', { name: 'serif', hidden: true }))
    await waitFor(() => expect(screen.getByRole('radio', { name: 'serif', hidden: true })).toBeChecked())
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-font', 'serif'))

    fireEvent.click(screen.getByRole('radio', { name: 'sans', hidden: true }))
    await waitFor(() => expect(screen.getByRole('radio', { name: 'sans', hidden: true })).toBeChecked())
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-font', 'sans'))
  })
})

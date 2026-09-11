import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { _resetFontLoaderForTests } from '@/hooks/useFontLoader'
import { TopBar } from '@/components/top-bar/TopBar'
import { useSettingsStore } from '@/store/settings.store'
import { renderApp, resetStores } from '@/test/render'

describe('top bar appearance controls', () => {
  beforeEach(() => {
    resetStores()
    _resetFontLoaderForTests()
  })

  it('cycles theme and switches the accent reflected on the document', async () => {
    renderApp(<TopBar />)
    fireEvent.click(screen.getByRole('button', { name: 'menu' }))

    fireEvent.click(screen.getByRole('button', { name: 'theme: system', hidden: true }))
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'))
    expect(useSettingsStore.getState().theme).toBe('light')

    fireEvent.click(screen.getByRole('button', { name: 'theme: light', hidden: true }))
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'))

    fireEvent.click(screen.getByRole('radio', { name: 'red', hidden: true }))
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-accent', 'red'))
    expect(screen.getByRole('radio', { name: 'red', hidden: true })).toBeChecked()
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

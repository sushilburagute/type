import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { HeaderMenu } from '@/components/header-menu/HeaderMenu'
import { useUiStore } from '@/store/ui.store'
import { renderApp, resetStores } from '@/test/render'

describe('HeaderMenu', () => {
  beforeEach(() => {
    resetStores()
  })

  it('groups secondary header controls behind a menu trigger', () => {
    renderApp(<HeaderMenu />)

    const trigger = screen.getByRole('button', { name: 'menu' })

    expect(trigger).toHaveAttribute('popovertarget')
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-label', 'menu')
    expect(screen.getByRole('radiogroup', { name: 'editor font', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'accent colour', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /theme: system/i, hidden: true })).toBeInTheDocument()
  })

  it('opens shortcut help from the menu', () => {
    renderApp(<HeaderMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'keyboard shortcuts', hidden: true }))

    expect(useUiStore.getState().shortcutsOpen).toBe(true)
  })
})

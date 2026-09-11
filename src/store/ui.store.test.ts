import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_TOASTS } from '@/constants/limits'
import { useUiStore } from '@/store/ui.store'
import { resetStores } from '@/test/render'

describe('ui store', () => {
  beforeEach(() => resetStores())

  it('opens, configures, and closes overlays', () => {
    const ui = useUiStore.getState()
    ui.setPaletteOpen(true)
    ui.setCompareOpen(true)
    ui.setShortcutsOpen(true)
    ui.setCompare('a', 'b')
    ui.requestFocus('b')

    expect(useUiStore.getState()).toMatchObject({
      paletteOpen: true,
      compareOpen: true,
      shortcutsOpen: true,
      compareA: 'a',
      compareB: 'b',
      focusRequestId: 'b',
    })

    useUiStore.getState().closeOverlays()
    expect(useUiStore.getState()).toMatchObject({
      paletteOpen: false,
      compareOpen: false,
      shortcutsOpen: false,
    })
  })

  it('bounds, dismisses, and reports toast-like messages', () => {
    for (let index = 0; index < MAX_TOASTS + 2; index++) {
      useUiStore.getState().pushToast(`message ${index}`)
    }
    const toasts = useUiStore.getState().toasts
    expect(toasts).toHaveLength(MAX_TOASTS)
    expect(toasts[0]?.message).toBe('message 2')

    useUiStore.getState().dismissToast(toasts[0]!.id)
    expect(useUiStore.getState().toasts).toHaveLength(MAX_TOASTS - 1)
    useUiStore.getState().setStorageWarning('storage full')
    expect(useUiStore.getState().storageWarning).toBe('storage full')
  })
})

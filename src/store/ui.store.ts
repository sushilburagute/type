import { create } from 'zustand'
import { MAX_TOASTS } from '@/constants/limits'

export interface Toast {
  id: number
  message: string
}

export interface UiState {
  paletteOpen: boolean
  compareOpen: boolean
  shortcutsOpen: boolean
  compareA: string | null
  compareB: string | null
  /** the editor with this id focuses its textarea then clears the request */
  focusRequestId: string | null
  toasts: Toast[]
  /** message shown once when localStorage is full; null when fine */
  storageWarning: string | null

  setPaletteOpen: (open: boolean) => void
  setCompareOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
  closeOverlays: () => void
  setCompare: (a: string | null, b: string | null) => void
  requestFocus: (id: string | null) => void
  pushToast: (message: string) => void
  dismissToast: (id: number) => void
  setStorageWarning: (message: string | null) => void
}

let toastSeq = 0

/** transient ui state — never persisted */
export const useUiStore = create<UiState>()((set) => ({
  paletteOpen: false,
  compareOpen: false,
  shortcutsOpen: false,
  compareA: null,
  compareB: null,
  focusRequestId: null,
  toasts: [],
  storageWarning: null,

  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setCompareOpen: (compareOpen) => set({ compareOpen }),
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
  closeOverlays: () => set({ paletteOpen: false, compareOpen: false, shortcutsOpen: false }),
  setCompare: (compareA, compareB) => set({ compareA, compareB }),
  requestFocus: (focusRequestId) => set({ focusRequestId }),
  pushToast: (message) =>
    set((s) => ({ toasts: [...s.toasts, { id: ++toastSeq, message }].slice(-MAX_TOASTS) })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setStorageWarning: (storageWarning) => set({ storageWarning }),
}))

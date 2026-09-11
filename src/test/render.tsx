import { type ReactElement } from 'react'
import { render } from '@testing-library/react'
import { createEditorDoc, useEditorsStore } from '@/store/editors.store'
import { DEFAULT_SETTINGS, useSettingsStore } from '@/store/settings.store'
import { useUiStore } from '@/store/ui.store'

// Test-only barrel: fast refresh does not apply in Vitest.
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'

/** puts every store back to a known state: one empty editor, default settings, no ui state */
export function resetStores(): void {
  const doc = createEditorDoc()
  useEditorsStore.setState({ editors: { [doc.id]: doc }, order: [doc.id], activeEditorId: doc.id })
  useSettingsStore.setState({ ...DEFAULT_SETTINGS })
  useUiStore.setState({
    paletteOpen: false,
    compareOpen: false,
    shortcutsOpen: false,
    compareA: null,
    compareB: null,
    focusRequestId: null,
    toasts: [],
    storageWarning: null,
  })
}

/** zustand is global, so no providers are needed — kept as a seam for future context */
export function renderApp(ui: ReactElement) {
  return render(ui)
}

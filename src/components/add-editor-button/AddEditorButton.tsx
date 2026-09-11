import { selectEditorCount, useEditorsStore } from '@/store/editors.store'
import { useUiStore } from '@/store/ui.store'
import { MAX_EDITORS } from '@/constants/limits'
import { PlusIcon } from '@/components/ui/icons'
import { track } from '@/utils/analytics'

/** the slim strip at the right edge — a full-height plus. */
export function AddEditorButton() {
  const count = useEditorsStore(selectEditorCount)
  const addEditor = useEditorsStore((s) => s.addEditor)
  const requestFocus = useUiStore((s) => s.requestFocus)
  const full = count >= MAX_EDITORS

  const onClick = () => {
    const id = addEditor()
    if (id) {
      requestFocus(id)
      track('add_editor', { count: count + 1 })
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={full}
      aria-label={full ? `maximum ${MAX_EDITORS} editors` : 'new editor'}
      title={full ? `maximum ${MAX_EDITORS} editors` : 'new editor (ctrl+shift+n)'}
      className="group flex w-12 shrink-0 items-center justify-center border-l border-line text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg sm:w-14"
    >
      <PlusIcon
        size={22}
        weight="bold"
        aria-hidden
        className="transition-transform duration-200 group-hover:rotate-90"
      />
    </button>
  )
}

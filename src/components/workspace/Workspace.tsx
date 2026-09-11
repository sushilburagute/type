import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { selectOrder, useEditorsStore } from '@/store/editors.store'
import { COARSE_POINTER } from '@/hooks/useMediaQuery'
import { Editor } from '@/components/editor/Editor'
import { AddEditorButton } from '@/components/add-editor-button/AddEditorButton'

/** editors side by side on wide screens, stacked on narrow. subscribes only to the id list. */
export function Workspace() {
  const order = useEditorsStore(useShallow(selectOrder))
  // autofocus the last-active editor once, on desktop only — on touch it would pop the keyboard before the user asked
  const [autoFocusId] = useState(() => {
    if (typeof window === 'undefined' || window.matchMedia(COARSE_POINTER).matches) return undefined
    return useEditorsStore.getState().activeEditorId ?? order[0]
  })

  return (
    <div className="flex min-h-0 flex-1">
      <div
        className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 md:auto-cols-fr md:grid-flow-col md:auto-rows-auto"
        data-testid="workspace"
      >
        {order.map((id, i) => (
          <Editor key={id} id={id} index={i} autoFocus={id === autoFocusId} />
        ))}
      </div>
      <AddEditorButton />
    </div>
  )
}

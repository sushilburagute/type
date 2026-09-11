import { memo, useCallback } from 'react'
import { selectActiveId, useEditorsStore } from '@/store/editors.store'
import { cn } from '@/utils/cn'
import { EditorTextarea } from '@/components/editor/EditorTextarea'
import { EditorToolbar } from '@/components/editor-toolbar/EditorToolbar'
import { EditorFooter } from '@/components/editor-footer/EditorFooter'

export interface EditorProps {
  id: string
  index: number
  autoFocus?: boolean
}

/** one editor column: toolbar, textarea, stats. the active column carries the accent rule. */
export const Editor = memo(function Editor({ id, index, autoFocus = false }: EditorProps) {
  const title = useEditorsStore((s) => s.editors[id]?.title)
  const rev = useEditorsStore((s) => s.editors[id]?.rev)
  const isActive = useEditorsStore(selectActiveId) === id
  const setActive = useEditorsStore((s) => s.setActive)
  const onFocus = useCallback(() => setActive(id), [id, setActive])

  if (title === undefined || rev === undefined) return null

  // Content changes from typing do not rerender the editor shell or textarea. A programmatic
  // update bumps rev, rerenders this component, and reads the latest content for DOM resync.
  const content = useEditorsStore.getState().editors[id]?.content ?? ''

  return (
    <section
      aria-label={`editor ${index + 1}: ${title}`}
      data-editor-id={id}
      data-active={isActive || undefined}
      className={cn(
        'anim-col relative flex min-h-0 min-w-0 flex-col border-l-2 border-line transition-colors duration-200',
        isActive && 'border-l-accent',
      )}
    >
      <EditorToolbar id={id} title={title} />
      <div className="min-h-0 flex-1">
        <EditorTextarea
          id={id}
          title={title}
          content={content}
          rev={rev}
          autoFocus={autoFocus}
          onFocus={onFocus}
        />
      </div>
      <EditorFooter id={id} />
    </section>
  )
})

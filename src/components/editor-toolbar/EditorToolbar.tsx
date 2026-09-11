import { type KeyboardEvent, useState } from 'react'
import { selectEditorCount, useEditorsStore } from '@/store/editors.store'
import { useClipboard } from '@/hooks/useClipboard'
import { flushInput } from '@/hooks/useEditorContent'
import { IconButton } from '@/components/ui/IconButton'
import { CopyIcon, EraserIcon, XIcon } from '@/components/ui/icons'
import { FormatMenu } from '@/components/format-menu/FormatMenu'

export interface EditorToolbarProps {
  id: string
  title: string
}

export function EditorToolbar({ id, title }: EditorToolbarProps) {
  const setTitle = useEditorsStore((s) => s.setTitle)
  const clearContent = useEditorsStore((s) => s.clearContent)
  const removeEditor = useEditorsStore((s) => s.removeEditor)
  const count = useEditorsStore(selectEditorCount)
  const hasContent = useEditorsStore((s) => (s.editors[id]?.content.length ?? 0) > 0)
  const { copy } = useClipboard()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)

  const commitTitle = () => {
    setTitle(id, draft)
    setEditing(false)
  }

  const onTitleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitTitle()
    if (e.key === 'Escape') {
      setDraft(title)
      setEditing(false)
    }
  }

  const onCopy = () => {
    flushInput(id)
    void copy(useEditorsStore.getState().editors[id]?.content ?? '')
  }

  const onClear = () => {
    flushInput(id)
    clearContent(id)
  }

  const onClose = () => {
    flushInput(id)
    const hasText = (useEditorsStore.getState().editors[id]?.content ?? '').trim().length > 0
    if (hasText && !window.confirm('close this editor? its text will be lost.')) return
    removeEditor(id)
  }

  return (
    <header className="flex h-11 shrink-0 items-center gap-1 border-b border-line pr-1 pl-3 sm:pl-4">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={onTitleKey}
          aria-label="editor title"
          maxLength={40}
          className="h-7 min-w-0 flex-1 rounded bg-surface-2 px-1.5 text-sm font-bold lowercase outline-none"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={() => {
            setDraft(title)
            setEditing(true)
          }}
          title="double-click to rename"
          className="min-w-0 flex-1 truncate text-left text-sm font-bold lowercase"
        >
          {title}
        </button>
      )}

      <FormatMenu editorId={id} />
      <IconButton icon={CopyIcon} label="copy" size="sm" onClick={onCopy} disabled={!hasContent} />
      <IconButton icon={EraserIcon} label="clear" size="sm" onClick={onClear} disabled={!hasContent} />
      <IconButton icon={XIcon} label="close editor" size="sm" onClick={onClose} disabled={count < 2} />
    </header>
  )
}

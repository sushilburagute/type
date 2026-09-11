import { type KeyboardEvent, memo, useEffect, useLayoutEffect, useRef } from 'react'
import { useEditorContent } from '@/hooks/useEditorContent'
import { useUiStore } from '@/store/ui.store'

export interface EditorTextareaProps {
  id: string
  title: string
  /** content at mount / after a programmatic change — the dom owns it while typing */
  content: string
  /** bumped by the store on programmatic changes; triggers a dom resync */
  rev: number
  autoFocus?: boolean
  onFocus: () => void
}

/**
 * plain <textarea>: zero javascript on the keystroke path, native undo/ime/selection, handles multi-mb pastes.
 * uncontrolled — see useEditorContent for the debounced store commit.
 */
export const EditorTextarea = memo(function EditorTextarea({
  id,
  title,
  content,
  rev,
  autoFocus = false,
  onFocus,
}: EditorTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const { onInput, flush } = useEditorContent(id)
  const focusRequestId = useUiStore((s) => s.focusRequestId)
  const requestFocus = useUiStore((s) => s.requestFocus)

  // programmatic changes (format, clear, rehydrate) land here; typing never bumps rev
  useLayoutEffect(() => {
    const el = ref.current
    if (el && el.value !== content) {
      el.value = content
      el.setSelectionRange(content.length, content.length)
    }
  }, [rev, content])

  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true })
  }, [autoFocus])

  useEffect(() => {
    if (focusRequestId === id) {
      ref.current?.focus({ preventScroll: true })
      requestFocus(null)
    }
  }, [focusRequestId, id, requestFocus])

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return
    e.preventDefault()
    const el = e.currentTarget
    const { selectionStart, selectionEnd } = el
    el.setRangeText('  ', selectionStart, selectionEnd, 'end')
    onInput(el.value)
  }

  return (
    <textarea
      ref={ref}
      aria-label={title}
      defaultValue={content}
      autoFocus={autoFocus}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      wrap="soft"
      placeholder="type or paste here…"
      onInput={(e) => onInput(e.currentTarget.value)}
      onBlur={flush}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className="font-editor block h-full w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-fg outline-none placeholder:text-muted/60 sm:px-5"
    />
  )
})

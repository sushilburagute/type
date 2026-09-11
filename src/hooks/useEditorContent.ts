import { useCallback, useEffect, useRef } from 'react'
import { INPUT_DEBOUNCE_MS } from '@/constants/limits'
import { useEditorsStore } from '@/store/editors.store'

/*
 * the textarea is uncontrolled: the dom owns the text while typing and we commit to the store on a short
 * trailing debounce. anything that reads the store (format, copy, compare) must call flushInput first so the
 * last few keystrokes are not lost.
 */
const flushers = new Map<string, () => void>()

export function flushInput(id?: string): void {
  if (id) {
    flushers.get(id)?.()
    return
  }
  for (const flush of flushers.values()) flush()
}

export function useEditorContent(id: string) {
  const setContent = useEditorsStore((s) => s.setContent)
  const pending = useRef<string | null>(null)
  const timer = useRef<number | null>(null)

  const flush = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    if (pending.current !== null) {
      const value = pending.current
      pending.current = null
      setContent(id, value)
    }
  }, [id, setContent])

  const onInput = useCallback(
    (value: string) => {
      pending.current = value
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, INPUT_DEBOUNCE_MS)
    },
    [flush],
  )

  useEffect(() => {
    flushers.set(id, flush)
    return () => {
      flush()
      flushers.delete(id)
    }
  }, [id, flush])

  return { onInput, flush }
}

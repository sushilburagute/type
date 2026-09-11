import { memo } from 'react'
import { useTextStats } from '@/hooks/useTextStats'
import { selectContent, useEditorsStore } from '@/store/editors.store'

export interface EditorFooterProps {
  id: string
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/** live counts. deferred so they never compete with the keystroke. */
export const EditorFooter = memo(function EditorFooter({ id }: EditorFooterProps) {
  const content = useEditorsStore(selectContent(id))
  const stats = useTextStats(content)
  return (
    <footer
      aria-live="off"
      className="flex h-9 shrink-0 items-center gap-4 overflow-hidden border-t border-line px-3 text-[11px] whitespace-nowrap text-muted tabular-nums sm:px-4"
    >
      <span>{plural(stats.chars, 'char')}</span>
      <span>{plural(stats.words, 'word')}</span>
      <span>{plural(stats.lines, 'line')}</span>
      <span className="hidden sm:inline">{plural(stats.sentences, 'sentence')}</span>
      {stats.readingMinutes > 0 && <span className="ml-auto">~{stats.readingMinutes} min read</span>}
    </footer>
  )
})

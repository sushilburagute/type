import { memo } from 'react'
import { type DisplayLine } from '@/types/diff'
import { cn } from '@/utils/cn'

export interface DiffLineProps {
  line?: DisplayLine
  /** which line number to show in the gutter */
  side: 'left' | 'right' | 'both'
}

const ROW_BG = { equal: '', add: 'bg-diff-add', remove: 'bg-diff-remove' } as const
const MARK_BG = { equal: '', add: 'bg-diff-add-strong', remove: 'bg-diff-remove-strong' } as const
const MARKER = { equal: ' ', add: '+', remove: '-' } as const

/** one rendered diff line. an empty `line` renders a blank placeholder cell (split mode). */
export const DiffLine = memo(function DiffLine({ line, side }: DiffLineProps) {
  if (!line) return <div className="h-6 bg-surface-2/60" aria-hidden />
  const nums = side === 'both' ? [line.leftN, line.rightN] : side === 'left' ? [line.leftN] : [line.rightN]
  return (
    <div className={cn('flex min-h-6 text-[13px] leading-6', ROW_BG[line.kind])} data-kind={line.kind}>
      {nums.map((n, i) => (
        <span key={i} className="w-10 shrink-0 pr-2 text-right text-muted tabular-nums select-none">
          {n ?? ''}
        </span>
      ))}
      <span className="w-4 shrink-0 text-muted select-none">{MARKER[line.kind]}</span>
      <span className="font-editor min-w-0 flex-1 pr-3 break-words whitespace-pre-wrap">
        {line.segments?.length
          ? line.segments.map((seg, i) =>
              seg.kind === 'equal' ? (
                <span key={i}>{seg.text}</span>
              ) : (
                <mark key={i} className={cn('rounded-sm text-inherit', MARK_BG[seg.kind])}>
                  {seg.text}
                </mark>
              ),
            )
          : line.text || ' '}
      </span>
    </div>
  )
})

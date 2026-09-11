import { useMemo } from 'react'
import { type DiffMode } from '@/types/settings'
import { type DiffResult } from '@/types/diff'
import { toSplit, toUnified } from '@/utils/diff'
import { DIFF_LINE_WARN_THRESHOLD } from '@/constants/limits'
import { DiffLine } from '@/components/compare/DiffLine'

export interface DiffViewProps {
  result: DiffResult
  mode: DiffMode
}

/** renders the same rows either as one column (unified) or two aligned columns (split) */
export function DiffView({ result, mode }: DiffViewProps) {
  const unified = useMemo(() => (mode === 'unified' ? toUnified(result.rows) : []), [result, mode])
  const split = useMemo(() => (mode === 'split' ? toSplit(result.rows) : []), [result, mode])

  if (result.identical) {
    return <p className="p-8 text-center text-sm text-muted">both editors have the same text</p>
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto" data-testid="diff-view" data-mode={mode}>
      {result.rows.length > DIFF_LINE_WARN_THRESHOLD && (
        <p className="border-b border-line px-4 py-2 text-xs text-muted">
          large diff ({result.rows.length.toLocaleString()} lines) — rendering may be slow
        </p>
      )}
      {mode === 'unified' ? (
        <div className="py-2">
          {unified.map((line, i) => (
            <DiffLine key={i} line={line} side="both" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 py-2">
          <div className="min-w-0 border-r border-line">
            {split.map((row, i) => (
              <DiffLine key={i} line={row.left} side="left" />
            ))}
          </div>
          <div className="min-w-0">
            {split.map((row, i) => (
              <DiffLine key={i} line={row.right} side="right" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

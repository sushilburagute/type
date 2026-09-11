import { DIFF_INTRALINE_MAX_ROWS } from '@/constants/limits'
import { type DiffResult } from '@/types/diff'
import { intraLine } from '@/utils/diff/intraLine'
import { pairChanges } from '@/utils/diff/pairChanges'
import { canonicalText } from '@/utils/diff/splitLines'

export interface ComputeDiffOptions {
  /** fill word-level segments on modified rows (skipped anyway above `DIFF_INTRALINE_MAX_ROWS`) */
  intraLine?: boolean
}

export function computeDiff(a: string, b: string, options: ComputeDiffOptions = {}): DiffResult {
  const rows = pairChanges(a, b)
  const withSegments = options.intraLine !== false && rows.length <= DIFF_INTRALINE_MAX_ROWS
  let added = 0
  let removed = 0
  for (const row of rows) {
    if (row.type === 'add') {
      added++
    } else if (row.type === 'remove') {
      removed++
    } else if (row.type === 'modify') {
      added++
      removed++
      if (withSegments) {
        const segments = intraLine(row.left.text, row.right.text)
        if (segments) {
          row.leftSegments = segments.leftSegments
          row.rightSegments = segments.rightSegments
        }
      }
    }
  }
  return { rows, added, removed, identical: canonicalText(a) === canonicalText(b) }
}

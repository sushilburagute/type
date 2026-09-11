import { diffWordsWithSpace, type Change } from 'diff'
import { type Segment, type SegmentKind } from '@/types/diff'

/** above this share of changed characters a word-level highlight is noise; highlight the whole line instead */
export const INTRALINE_MAX_CHANGED_RATIO = 0.6

export interface IntraLineResult {
  leftSegments: Segment[]
  rightSegments: Segment[]
}

function pushSegment(segments: Segment[], text: string, kind: SegmentKind): void {
  const last = segments[segments.length - 1]
  if (last && last.kind === kind) {
    last.text += text
    return
  }
  segments.push({ text, kind })
}

/** turn a word-level change list into per-side segment lists, merging adjacent segments of the same kind */
export function segmentsFromChanges(changes: readonly Change[]): IntraLineResult {
  const leftSegments: Segment[] = []
  const rightSegments: Segment[] = []
  for (const change of changes) {
    if (change.removed) {
      pushSegment(leftSegments, change.value, 'remove')
    } else if (change.added) {
      pushSegment(rightSegments, change.value, 'add')
    } else {
      pushSegment(leftSegments, change.value, 'equal')
      pushSegment(rightSegments, change.value, 'equal')
    }
  }
  return { leftSegments, rightSegments }
}

/**
 * word-level diff of one modified line pair.
 * returns `null` when either side is empty or when more than 60% of the characters changed,
 * in which case the caller should highlight the whole line.
 */
export function intraLine(left: string, right: string): IntraLineResult | null {
  if (left === '' || right === '') return null
  const changes = diffWordsWithSpace(left, right)
  let changed = 0
  for (const change of changes) {
    if (change.added || change.removed) changed += change.value.length
  }
  if (changed / (left.length + right.length) > INTRALINE_MAX_CHANGED_RATIO) return null
  return segmentsFromChanges(changes)
}

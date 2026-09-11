import { diffLines } from 'diff'
import { type DiffRow } from '@/types/diff'
import { canonicalText, splitLines } from '@/utils/diff/splitLines'

/**
 * line-level diff of `a` against `b`, as one row per line.
 * a removed chunk immediately followed by an added chunk is zipped line by line
 * into `modify` rows (with empty segments; intra-line highlighting is a separate pass),
 * the leftover lines of the longer chunk become plain `remove` / `add` rows.
 */
export function pairChanges(a: string, b: string): DiffRow[] {
  const rows: DiffRow[] = []
  let leftN = 1
  let rightN = 1
  let pendingRemoved: string[] = []

  const flushRemoved = (): void => {
    for (const text of pendingRemoved) rows.push({ type: 'remove', left: { n: leftN++, text } })
    pendingRemoved = []
  }

  // without ignoreNewlineAtEof jsdiff treats the final line `'b'` as a different token than `'b\n'`
  for (const change of diffLines(canonicalText(a), canonicalText(b), { ignoreNewlineAtEof: true })) {
    const lines = splitLines(change.value)
    if (change.removed) {
      flushRemoved()
      pendingRemoved = lines
      continue
    }
    if (change.added) {
      for (const [k, leftText] of pendingRemoved.entries()) {
        const rightText = lines[k]
        if (rightText === undefined) {
          rows.push({ type: 'remove', left: { n: leftN++, text: leftText } })
        } else {
          rows.push({
            type: 'modify',
            left: { n: leftN++, text: leftText },
            right: { n: rightN++, text: rightText },
            leftSegments: [],
            rightSegments: [],
          })
        }
      }
      for (const text of lines.slice(pendingRemoved.length)) {
        rows.push({ type: 'add', right: { n: rightN++, text } })
      }
      pendingRemoved = []
      continue
    }
    flushRemoved()
    for (const text of lines) {
      rows.push({ type: 'equal', left: { n: leftN++, text }, right: { n: rightN++, text } })
    }
  }
  flushRemoved()
  return rows
}

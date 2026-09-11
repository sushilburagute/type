import { type DiffRow, type SplitRow } from '@/types/diff'

/**
 * lay diff rows out as two aligned columns.
 * plain remove / add rows each get their own row with one empty cell;
 * `pairChanges` has already paired what can be paired into modify rows.
 */
export function toSplit(rows: readonly DiffRow[]): SplitRow[] {
  return rows.map((row): SplitRow => {
    switch (row.type) {
      case 'equal':
        return {
          left: { kind: 'equal', leftN: row.left.n, text: row.left.text },
          right: { kind: 'equal', rightN: row.right.n, text: row.right.text },
        }
      case 'remove':
        return { left: { kind: 'remove', leftN: row.left.n, text: row.left.text } }
      case 'add':
        return { right: { kind: 'add', rightN: row.right.n, text: row.right.text } }
      case 'modify':
        return {
          left: {
            kind: 'remove',
            leftN: row.left.n,
            text: row.left.text,
            ...(row.leftSegments.length > 0 ? { segments: row.leftSegments } : {}),
          },
          right: {
            kind: 'add',
            rightN: row.right.n,
            text: row.right.text,
            ...(row.rightSegments.length > 0 ? { segments: row.rightSegments } : {}),
          },
        }
    }
  })
}

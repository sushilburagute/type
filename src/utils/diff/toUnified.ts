import { type DiffRow, type DisplayLine } from '@/types/diff'

/** flatten diff rows into the single-column unified view; a modify row becomes a remove line then an add line */
export function toUnified(rows: readonly DiffRow[]): DisplayLine[] {
  const lines: DisplayLine[] = []
  for (const row of rows) {
    switch (row.type) {
      case 'equal':
        lines.push({ kind: 'equal', leftN: row.left.n, rightN: row.right.n, text: row.left.text })
        break
      case 'remove':
        lines.push({ kind: 'remove', leftN: row.left.n, text: row.left.text })
        break
      case 'add':
        lines.push({ kind: 'add', rightN: row.right.n, text: row.right.text })
        break
      case 'modify':
        lines.push({
          kind: 'remove',
          leftN: row.left.n,
          text: row.left.text,
          ...(row.leftSegments.length > 0 ? { segments: row.leftSegments } : {}),
        })
        lines.push({
          kind: 'add',
          rightN: row.right.n,
          text: row.right.text,
          ...(row.rightSegments.length > 0 ? { segments: row.rightSegments } : {}),
        })
        break
    }
  }
  return lines
}

import { describe, expect, it, vi } from 'vitest'
import { computeDiff } from '@/utils/diff/computeDiff'

vi.mock('@/constants/limits', () => ({ DIFF_INTRALINE_MAX_ROWS: 2 }))

describe('computeDiff intra-line row limit', () => {
  it('fills segments when the row count is at or below the limit', () => {
    const result = computeDiff('a 1\nb 1', 'a 2\nb 2')
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toMatchObject({
      type: 'modify',
      leftSegments: [
        { text: 'a ', kind: 'equal' },
        { text: '1', kind: 'remove' },
      ],
      rightSegments: [
        { text: 'a ', kind: 'equal' },
        { text: '2', kind: 'add' },
      ],
    })
  })

  it('skips segments once the row count exceeds the limit', () => {
    const result = computeDiff('a 1\nb 1\nc 1', 'a 2\nb 2\nc 2')
    expect(result.rows).toHaveLength(3)
    for (const row of result.rows) {
      expect(row).toMatchObject({ type: 'modify', leftSegments: [], rightSegments: [] })
    }
    expect(result).toMatchObject({ added: 3, removed: 3, identical: false })
  })
})

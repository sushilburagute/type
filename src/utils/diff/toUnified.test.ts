import { describe, expect, it } from 'vitest'
import { type DiffRow } from '@/types/diff'
import { toUnified } from '@/utils/diff/toUnified'

describe('toUnified', () => {
  it('returns no lines for no rows', () => {
    expect(toUnified([])).toEqual([])
  })

  it('maps equal rows to equal lines with both numbers', () => {
    const rows: DiffRow[] = [{ type: 'equal', left: { n: 3, text: 'same' }, right: { n: 5, text: 'same' } }]
    expect(toUnified(rows)).toEqual([{ kind: 'equal', leftN: 3, rightN: 5, text: 'same' }])
  })

  it('maps remove rows to remove lines with only the left number', () => {
    const rows: DiffRow[] = [{ type: 'remove', left: { n: 2, text: 'gone' } }]
    expect(toUnified(rows)).toEqual([{ kind: 'remove', leftN: 2, text: 'gone' }])
  })

  it('maps add rows to add lines with only the right number', () => {
    const rows: DiffRow[] = [{ type: 'add', right: { n: 4, text: 'new' } }]
    expect(toUnified(rows)).toEqual([{ kind: 'add', rightN: 4, text: 'new' }])
  })

  it('expands a modify row into a remove line then an add line carrying their segments', () => {
    const rows: DiffRow[] = [
      {
        type: 'modify',
        left: { n: 1, text: 'a b' },
        right: { n: 1, text: 'a c' },
        leftSegments: [
          { text: 'a ', kind: 'equal' },
          { text: 'b', kind: 'remove' },
        ],
        rightSegments: [
          { text: 'a ', kind: 'equal' },
          { text: 'c', kind: 'add' },
        ],
      },
    ]
    expect(toUnified(rows)).toEqual([
      {
        kind: 'remove',
        leftN: 1,
        text: 'a b',
        segments: [
          { text: 'a ', kind: 'equal' },
          { text: 'b', kind: 'remove' },
        ],
      },
      {
        kind: 'add',
        rightN: 1,
        text: 'a c',
        segments: [
          { text: 'a ', kind: 'equal' },
          { text: 'c', kind: 'add' },
        ],
      },
    ])
  })

  it('omits the segments key on modify lines with empty segments', () => {
    const rows: DiffRow[] = [
      {
        type: 'modify',
        left: { n: 1, text: 'x' },
        right: { n: 1, text: 'y' },
        leftSegments: [],
        rightSegments: [],
      },
    ]
    const lines = toUnified(rows)
    expect(lines).toEqual([
      { kind: 'remove', leftN: 1, text: 'x' },
      { kind: 'add', rightN: 1, text: 'y' },
    ])
    expect(lines[0]).not.toHaveProperty('segments')
    expect(lines[1]).not.toHaveProperty('segments')
  })

  it('preserves row order across mixed rows', () => {
    const rows: DiffRow[] = [
      { type: 'equal', left: { n: 1, text: 'a' }, right: { n: 1, text: 'a' } },
      { type: 'remove', left: { n: 2, text: 'b' } },
      { type: 'add', right: { n: 2, text: 'c' } },
      {
        type: 'modify',
        left: { n: 3, text: 'd' },
        right: { n: 3, text: 'e' },
        leftSegments: [],
        rightSegments: [],
      },
    ]
    expect(toUnified(rows).map((line) => line.kind)).toEqual(['equal', 'remove', 'add', 'remove', 'add'])
  })
})

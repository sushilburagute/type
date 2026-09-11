import { describe, expect, it } from 'vitest'
import { type DiffRow } from '@/types/diff'
import { toSplit } from '@/utils/diff/toSplit'

describe('toSplit', () => {
  it('returns no rows for no rows', () => {
    expect(toSplit([])).toEqual([])
  })

  it('fills both cells for equal rows', () => {
    const rows: DiffRow[] = [{ type: 'equal', left: { n: 3, text: 'same' }, right: { n: 5, text: 'same' } }]
    expect(toSplit(rows)).toEqual([
      {
        left: { kind: 'equal', leftN: 3, text: 'same' },
        right: { kind: 'equal', rightN: 5, text: 'same' },
      },
    ])
  })

  it('fills only the left cell for remove rows', () => {
    const rows: DiffRow[] = [{ type: 'remove', left: { n: 2, text: 'gone' } }]
    const split = toSplit(rows)
    expect(split).toEqual([{ left: { kind: 'remove', leftN: 2, text: 'gone' } }])
    expect(split[0]).not.toHaveProperty('right')
  })

  it('fills only the right cell for add rows', () => {
    const rows: DiffRow[] = [{ type: 'add', right: { n: 4, text: 'new' } }]
    const split = toSplit(rows)
    expect(split).toEqual([{ right: { kind: 'add', rightN: 4, text: 'new' } }])
    expect(split[0]).not.toHaveProperty('left')
  })

  it('fills both cells with their own segments for modify rows', () => {
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
    expect(toSplit(rows)).toEqual([
      {
        left: {
          kind: 'remove',
          leftN: 1,
          text: 'a b',
          segments: [
            { text: 'a ', kind: 'equal' },
            { text: 'b', kind: 'remove' },
          ],
        },
        right: {
          kind: 'add',
          rightN: 1,
          text: 'a c',
          segments: [
            { text: 'a ', kind: 'equal' },
            { text: 'c', kind: 'add' },
          ],
        },
      },
    ])
  })

  it('omits the segments key on modify cells with empty segments', () => {
    const rows: DiffRow[] = [
      {
        type: 'modify',
        left: { n: 1, text: 'x' },
        right: { n: 1, text: 'y' },
        leftSegments: [],
        rightSegments: [],
      },
    ]
    const split = toSplit(rows)
    expect(split).toEqual([
      { left: { kind: 'remove', leftN: 1, text: 'x' }, right: { kind: 'add', rightN: 1, text: 'y' } },
    ])
    expect(split[0]?.left).not.toHaveProperty('segments')
    expect(split[0]?.right).not.toHaveProperty('segments')
  })

  it('does not re-pair consecutive remove and add rows', () => {
    const rows: DiffRow[] = [
      { type: 'remove', left: { n: 1, text: 'a' } },
      { type: 'add', right: { n: 1, text: 'b' } },
    ]
    expect(toSplit(rows)).toEqual([
      { left: { kind: 'remove', leftN: 1, text: 'a' } },
      { right: { kind: 'add', rightN: 1, text: 'b' } },
    ])
  })
})

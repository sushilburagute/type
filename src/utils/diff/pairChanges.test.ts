import { describe, expect, it } from 'vitest'
import { type DiffRow } from '@/types/diff'
import { pairChanges } from '@/utils/diff/pairChanges'

const types = (rows: DiffRow[]): string[] => rows.map((row) => row.type)

describe('pairChanges', () => {
  it('returns no rows when both sides are empty', () => {
    expect(pairChanges('', '')).toEqual([])
  })

  it('emits one equal row per line for identical text with 1-based numbers', () => {
    expect(pairChanges('a\nb', 'a\nb')).toEqual([
      { type: 'equal', left: { n: 1, text: 'a' }, right: { n: 1, text: 'a' } },
      { type: 'equal', left: { n: 2, text: 'b' }, right: { n: 2, text: 'b' } },
    ])
  })

  it('emits only add rows when the left side is empty', () => {
    expect(pairChanges('', 'a\nb')).toEqual([
      { type: 'add', right: { n: 1, text: 'a' } },
      { type: 'add', right: { n: 2, text: 'b' } },
    ])
  })

  it('emits only remove rows when the right side is empty', () => {
    expect(pairChanges('a\nb', '')).toEqual([
      { type: 'remove', left: { n: 1, text: 'a' } },
      { type: 'remove', left: { n: 2, text: 'b' } },
    ])
  })

  it('zips a removed chunk with the following added chunk into modify rows with empty segments', () => {
    const rows = pairChanges('keep\nold\nkeep', 'keep\nnew\nkeep')
    expect(rows).toEqual([
      { type: 'equal', left: { n: 1, text: 'keep' }, right: { n: 1, text: 'keep' } },
      {
        type: 'modify',
        left: { n: 2, text: 'old' },
        right: { n: 2, text: 'new' },
        leftSegments: [],
        rightSegments: [],
      },
      { type: 'equal', left: { n: 3, text: 'keep' }, right: { n: 3, text: 'keep' } },
    ])
  })

  it('turns the surplus removed lines into remove rows after the pairs', () => {
    const rows = pairChanges('keep\none\ntwo\nthree\nkeep', 'keep\nuno\ndos\nkeep')
    expect(types(rows)).toEqual(['equal', 'modify', 'modify', 'remove', 'equal'])
    expect(rows[3]).toEqual({ type: 'remove', left: { n: 4, text: 'three' } })
    expect(rows[4]).toEqual({ type: 'equal', left: { n: 5, text: 'keep' }, right: { n: 4, text: 'keep' } })
  })

  it('turns the surplus added lines into add rows after the pairs', () => {
    const rows = pairChanges('keep\none\nkeep', 'keep\nuno\ndos\ntres\nkeep')
    expect(types(rows)).toEqual(['equal', 'modify', 'add', 'add', 'equal'])
    expect(rows[2]).toEqual({ type: 'add', right: { n: 3, text: 'dos' } })
    expect(rows[3]).toEqual({ type: 'add', right: { n: 4, text: 'tres' } })
    expect(rows[4]).toEqual({ type: 'equal', left: { n: 3, text: 'keep' }, right: { n: 5, text: 'keep' } })
  })

  it('keeps a removed chunk that is not followed by an added chunk as remove rows', () => {
    const rows = pairChanges('a\nb\nc', 'a\nc')
    expect(rows).toEqual([
      { type: 'equal', left: { n: 1, text: 'a' }, right: { n: 1, text: 'a' } },
      { type: 'remove', left: { n: 2, text: 'b' } },
      { type: 'equal', left: { n: 3, text: 'c' }, right: { n: 2, text: 'c' } },
    ])
  })

  it('flushes a trailing removed chunk at the end of the text', () => {
    const rows = pairChanges('a\nb', 'a')
    expect(rows).toEqual([
      { type: 'equal', left: { n: 1, text: 'a' }, right: { n: 1, text: 'a' } },
      { type: 'remove', left: { n: 2, text: 'b' } },
    ])
  })

  it('keeps an added chunk that does not follow a removed chunk as add rows', () => {
    const rows = pairChanges('a\nc', 'a\nb\nc')
    expect(types(rows)).toEqual(['equal', 'add', 'equal'])
    expect(rows[1]).toEqual({ type: 'add', right: { n: 2, text: 'b' } })
  })

  it('counts interior empty lines correctly', () => {
    const rows = pairChanges('a\n\nb', 'a\n\nc')
    expect(types(rows)).toEqual(['equal', 'equal', 'modify'])
    expect(rows[1]).toEqual({ type: 'equal', left: { n: 2, text: '' }, right: { n: 2, text: '' } })
  })

  it('is insensitive to line endings and a trailing newline', () => {
    expect(types(pairChanges('a\r\nb\r\n', 'a\nb'))).toEqual(['equal', 'equal'])
  })
})

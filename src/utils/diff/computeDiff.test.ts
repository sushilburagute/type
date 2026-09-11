import { describe, expect, it } from 'vitest'
import { DIFF_INTRALINE_MAX_ROWS } from '@/constants/limits'
import { type DiffResult, type DiffRow } from '@/types/diff'
import * as fixtures from '@/utils/diff/__fixtures__'
import { computeDiff } from '@/utils/diff/computeDiff'
import { splitLines } from '@/utils/diff/splitLines'

const types = (rows: DiffRow[]): string[] => rows.map((row) => row.type)

const leftTexts = (rows: DiffRow[]): string[] =>
  rows.flatMap((row) => (row.type === 'add' ? [] : [row.left.text]))

const rightTexts = (rows: DiffRow[]): string[] =>
  rows.flatMap((row) => (row.type === 'remove' ? [] : [row.right.text]))

const leftNumbers = (rows: DiffRow[]): number[] =>
  rows.flatMap((row) => (row.type === 'add' ? [] : [row.left.n]))

const rightNumbers = (rows: DiffRow[]): number[] =>
  rows.flatMap((row) => (row.type === 'remove' ? [] : [row.right.n]))

const sequence = (length: number): number[] => Array.from({ length }, (_, i) => i + 1)

/** every side reconstructs its own input and numbers its lines 1..n in order */
function expectInvariants(result: DiffResult, a: string, b: string): void {
  expect(leftTexts(result.rows)).toEqual(splitLines(a))
  expect(rightTexts(result.rows)).toEqual(splitLines(b))
  expect(leftNumbers(result.rows)).toEqual(sequence(splitLines(a).length))
  expect(rightNumbers(result.rows)).toEqual(sequence(splitLines(b).length))
}

describe('computeDiff', () => {
  it.each(Object.entries(fixtures))('holds the reconstruction invariant for fixture %s', (_name, fixture) => {
    expectInvariants(computeDiff(fixture.a, fixture.b), fixture.a, fixture.b)
  })

  it('reports identical text as identical with only equal rows', () => {
    const { a, b } = fixtures.identical
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['equal', 'equal', 'equal'])
    expect(result).toMatchObject({ added: 0, removed: 0, identical: true })
  })

  it('counts pure additions', () => {
    const { a, b } = fixtures.addOnly
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['equal', 'add', 'equal', 'add'])
    expect(result).toMatchObject({ added: 2, removed: 0, identical: false })
  })

  it('counts pure removals', () => {
    const { a, b } = fixtures.removeOnly
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['equal', 'remove', 'equal', 'remove'])
    expect(result).toMatchObject({ added: 0, removed: 2, identical: false })
  })

  it('fills word-level segments on a single modified line', () => {
    const { a, b } = fixtures.singleModifiedLine
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['equal', 'modify', 'equal'])
    expect(result).toMatchObject({ added: 1, removed: 1, identical: false })
    expect(result.rows[1]).toEqual({
      type: 'modify',
      left: { n: 2, text: 'const b = 2' },
      right: { n: 2, text: 'const b = 20' },
      leftSegments: [
        { text: 'const b = ', kind: 'equal' },
        { text: '2', kind: 'remove' },
      ],
      rightSegments: [
        { text: 'const b = ', kind: 'equal' },
        { text: '20', kind: 'add' },
      ],
    })
  })

  it('represents a moved block as removals and additions', () => {
    const { a, b } = fixtures.movedBlock
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['add', 'add', 'equal', 'equal', 'equal', 'remove', 'remove'])
    expect(result).toMatchObject({ added: 2, removed: 2, identical: false })
  })

  it('treats crlf and lf line endings as identical', () => {
    const { a, b } = fixtures.crlfVsLf
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['equal', 'equal', 'equal'])
    expect(result).toMatchObject({ added: 0, removed: 0, identical: true })
  })

  it('treats a trailing newline as identical', () => {
    const { a, b } = fixtures.trailingNewline
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['equal', 'equal'])
    expect(result).toMatchObject({ added: 0, removed: 0, identical: true })
  })

  it('handles an empty left side', () => {
    const { a, b } = fixtures.emptyVsText
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['add', 'add'])
    expect(result).toMatchObject({ added: 2, removed: 0, identical: false })
  })

  it('handles an empty right side', () => {
    const { a, b } = fixtures.textVsEmpty
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['remove', 'remove'])
    expect(result).toMatchObject({ added: 0, removed: 2, identical: false })
  })

  it('handles both sides empty', () => {
    const { a, b } = fixtures.bothEmpty
    expect(computeDiff(a, b)).toEqual({ rows: [], added: 0, removed: 0, identical: true })
  })

  it('highlights emoji and cjk edits', () => {
    const { a, b } = fixtures.unicode
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['modify', 'modify', 'equal'])
    expect(result).toMatchObject({ added: 2, removed: 2, identical: false })
    expect(result.rows[0]).toMatchObject({
      leftSegments: [
        { text: 'héllo ', kind: 'equal' },
        { text: '👋', kind: 'remove' },
        { text: ' wörld', kind: 'equal' },
      ],
      rightSegments: [
        { text: 'héllo ', kind: 'equal' },
        { text: '🌍', kind: 'add' },
        { text: ' wörld', kind: 'equal' },
      ],
    })
    expect(result.rows[1]).toMatchObject({
      leftSegments: [
        { text: '日本語の', kind: 'equal' },
        { text: 'テキスト', kind: 'remove' },
      ],
      rightSegments: [
        { text: '日本語の', kind: 'equal' },
        { text: '文章', kind: 'add' },
      ],
    })
  })

  it('zips 3 removed and 2 added lines into 2 modify rows and 1 remove row', () => {
    const { a, b } = fixtures.multiModify
    const result = computeDiff(a, b)
    expect(types(result.rows)).toEqual(['equal', 'modify', 'modify', 'remove', 'equal'])
    expect(result).toMatchObject({ added: 2, removed: 3, identical: false })
  })

  it('leaves segments empty when the lines are too different for a word-level highlight', () => {
    const { a, b } = fixtures.multiModify
    const result = computeDiff(a, b)
    expect(result.rows[1]).toMatchObject({ type: 'modify', leftSegments: [], rightSegments: [] })
    expect(result.rows[2]).toMatchObject({ type: 'modify', leftSegments: [], rightSegments: [] })
  })

  it('skips segments when intraLine is disabled', () => {
    const { a, b } = fixtures.singleModifiedLine
    const result = computeDiff(a, b, { intraLine: false })
    expect(result.rows[1]).toMatchObject({ type: 'modify', leftSegments: [], rightSegments: [] })
    expect(result).toMatchObject({ added: 1, removed: 1, identical: false })
  })

  it('fills segments when intraLine is explicitly enabled', () => {
    const { a, b } = fixtures.singleModifiedLine
    const result = computeDiff(a, b, { intraLine: true })
    expect(result.rows[1]).toMatchObject({
      type: 'modify',
      leftSegments: [
        { text: 'const b = ', kind: 'equal' },
        { text: '2', kind: 'remove' },
      ],
    })
  })

  it('exposes the row limit used for the intra-line cut-off', () => {
    expect(DIFF_INTRALINE_MAX_ROWS).toBe(20000)
  })
})

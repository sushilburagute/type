import { describe, expect, it } from 'vitest'
import { INTRALINE_MAX_CHANGED_RATIO, intraLine, segmentsFromChanges } from '@/utils/diff/intraLine'

describe('intraLine', () => {
  it('returns null when either side is empty', () => {
    expect(intraLine('', 'text')).toBeNull()
    expect(intraLine('text', '')).toBeNull()
    expect(intraLine('', '')).toBeNull()
  })

  it('splits a single changed word into equal / remove / add segments', () => {
    expect(intraLine('const b = 2', 'const b = 20')).toEqual({
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

  it('keeps whitespace as equal segments between changed words', () => {
    expect(intraLine('a b c', 'a x c')).toEqual({
      leftSegments: [
        { text: 'a ', kind: 'equal' },
        { text: 'b', kind: 'remove' },
        { text: ' c', kind: 'equal' },
      ],
      rightSegments: [
        { text: 'a ', kind: 'equal' },
        { text: 'x', kind: 'add' },
        { text: ' c', kind: 'equal' },
      ],
    })
  })

  it('returns only equal segments for identical lines', () => {
    expect(intraLine('same', 'same')).toEqual({
      leftSegments: [{ text: 'same', kind: 'equal' }],
      rightSegments: [{ text: 'same', kind: 'equal' }],
    })
  })

  it('handles emoji and cjk edits', () => {
    expect(intraLine('héllo 👋 wörld', 'héllo 🌍 wörld')).toEqual({
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
    expect(intraLine('日本語のテキスト', '日本語の文章')).toEqual({
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

  it('returns null when more than 60% of the characters changed', () => {
    expect(INTRALINE_MAX_CHANGED_RATIO).toBe(0.6)
    expect(intraLine('one', 'uno')).toBeNull()
    expect(intraLine('foo bar', 'completely different text')).toBeNull()
  })

  it('keeps segments when exactly 60% of the characters changed', () => {
    // 'ab cde' vs 'ab xyz': changed 3 + 3 = 6 of 12 chars → 0.5
    expect(intraLine('ab cde', 'ab xyz')).not.toBeNull()
    // 'ab cdefg' vs 'ab vwxyz': changed 5 + 5 = 10 of 16 chars → 0.625
    expect(intraLine('ab cdefg', 'ab vwxyz')).toBeNull()
  })
})

describe('segmentsFromChanges', () => {
  it('merges adjacent segments of the same kind on each side', () => {
    const result = segmentsFromChanges([
      { value: 'a', added: false, removed: false, count: 1 },
      { value: 'b', added: false, removed: false, count: 1 },
      { value: 'x', added: false, removed: true, count: 1 },
      { value: 'y', added: false, removed: true, count: 1 },
      { value: 'p', added: true, removed: false, count: 1 },
      { value: 'q', added: true, removed: false, count: 1 },
      { value: 'c', added: false, removed: false, count: 1 },
    ])
    expect(result).toEqual({
      leftSegments: [
        { text: 'ab', kind: 'equal' },
        { text: 'xy', kind: 'remove' },
        { text: 'c', kind: 'equal' },
      ],
      rightSegments: [
        { text: 'ab', kind: 'equal' },
        { text: 'pq', kind: 'add' },
        { text: 'c', kind: 'equal' },
      ],
    })
  })

  it('returns empty segment lists for no changes', () => {
    expect(segmentsFromChanges([])).toEqual({ leftSegments: [], rightSegments: [] })
  })
})

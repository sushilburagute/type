import { describe, it, expect } from 'vitest'
import { computeStats, formatStats, type TextStats } from '@/utils/text/stats'
import { READING_WPM } from '@/constants/limits'

describe('computeStats', () => {
  it('returns zeros for empty input', () => {
    expect(computeStats('')).toEqual({ chars: 0, words: 0, lines: 0, sentences: 0, readingMinutes: 0 })
  })

  it('counts whitespace-only input as one line with no words', () => {
    expect(computeStats('   ')).toEqual({ chars: 3, words: 0, lines: 1, sentences: 0, readingMinutes: 0 })
  })

  it.each([
    ['hello', 5, 1, 1, 1],
    ['hello world', 11, 2, 1, 1],
    ['hello world.', 12, 2, 1, 1],
    ['one. two! three?', 16, 3, 1, 3],
    ['wait... what?!', 14, 2, 1, 2],
    ['version 3.5 is out', 18, 5, 1, 1],
    ["don't stop me now", 17, 4, 1, 1],
    ['a\nb\nc', 5, 3, 3, 1],
    ['a\n\nb\n', 5, 2, 4, 1],
    ['héllo wörld 日本語', 15, 3, 1, 1],
    ['😀 😀', 5, 0, 1, 0],
    ['1 2 3', 5, 3, 1, 1],
    ['...', 3, 0, 1, 1],
  ])('%j → chars %i, words %i, lines %i, sentences %i', (input, chars, words, lines, sentences) => {
    expect(computeStats(input)).toMatchObject({ chars, words, lines, sentences })
  })

  it('uses utf-16 length for chars', () => {
    expect(computeStats('😀').chars).toBe(2)
  })

  it('rounds reading time up', () => {
    expect(computeStats('word').readingMinutes).toBe(1)
    expect(computeStats(Array.from({ length: READING_WPM }, () => 'w').join(' ')).readingMinutes).toBe(1)
    expect(computeStats(Array.from({ length: READING_WPM + 1 }, () => 'w').join(' ')).readingMinutes).toBe(2)
  })
})

describe('formatStats', () => {
  const stats = (overrides: Partial<TextStats>): TextStats => ({
    chars: 0,
    words: 0,
    lines: 0,
    sentences: 0,
    readingMinutes: 0,
    ...overrides,
  })

  it('formats plurals and the read segment', () => {
    expect(formatStats(stats({ chars: 12, words: 3, lines: 1, sentences: 1, readingMinutes: 1 }))).toBe(
      '12 chars · 3 words · 1 line · 1 sentence · ~1 min read',
    )
  })

  it('formats singulars', () => {
    expect(formatStats(stats({ chars: 1, words: 1, lines: 1, sentences: 1, readingMinutes: 1 }))).toBe(
      '1 char · 1 word · 1 line · 1 sentence · ~1 min read',
    )
  })

  it('pluralises zero and omits the read segment at 0', () => {
    expect(formatStats(stats({}))).toBe('0 chars · 0 words · 0 lines · 0 sentences')
  })

  it('formats larger read times', () => {
    expect(formatStats(stats({ chars: 5000, words: 900, lines: 20, sentences: 40, readingMinutes: 5 }))).toBe(
      '5000 chars · 900 words · 20 lines · 40 sentences · ~5 min read',
    )
  })

  it('round-trips with computeStats', () => {
    expect(formatStats(computeStats('hello world. bye.'))).toBe(
      '17 chars · 3 words · 1 line · 2 sentences · ~1 min read',
    )
  })
})

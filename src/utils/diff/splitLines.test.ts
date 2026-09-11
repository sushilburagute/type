import { describe, expect, it } from 'vitest'
import { canonicalText, normaliseNewlines, splitLines } from '@/utils/diff/splitLines'

describe('normaliseNewlines', () => {
  it('turns crlf and lone cr into lf', () => {
    expect(normaliseNewlines('a\r\nb\rc\nd')).toBe('a\nb\nc\nd')
  })

  it('leaves lf-only text untouched', () => {
    expect(normaliseNewlines('a\nb')).toBe('a\nb')
  })
})

describe('splitLines', () => {
  it('returns no lines for an empty string', () => {
    expect(splitLines('')).toEqual([])
  })

  it('splits on lf', () => {
    expect(splitLines('a\nb\nc')).toEqual(['a', 'b', 'c'])
  })

  it('normalises crlf and cr before splitting', () => {
    expect(splitLines('a\r\nb\rc')).toEqual(['a', 'b', 'c'])
  })

  it('does not produce a phantom empty last line for a trailing newline', () => {
    expect(splitLines('a\nb\n')).toEqual(['a', 'b'])
    expect(splitLines('a\r\nb\r\n')).toEqual(['a', 'b'])
  })

  it('keeps interior empty lines', () => {
    expect(splitLines('a\n\nb')).toEqual(['a', '', 'b'])
  })

  it('keeps one empty line when the text ends with two newlines', () => {
    expect(splitLines('a\n\n')).toEqual(['a', ''])
  })

  it('treats a lone newline as one empty line', () => {
    expect(splitLines('\n')).toEqual([''])
  })

  it('returns a single line for text without newlines', () => {
    expect(splitLines('solo')).toEqual(['solo'])
  })
})

describe('canonicalText', () => {
  it('is insensitive to line endings and a trailing newline', () => {
    expect(canonicalText('a\r\nb\r\n')).toBe('a\nb')
    expect(canonicalText('a\nb')).toBe('a\nb')
    expect(canonicalText('')).toBe('')
  })
})

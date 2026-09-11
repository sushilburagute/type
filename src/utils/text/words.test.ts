import { describe, it, expect } from 'vitest'
import { normalizeNewlines, splitWords, transformLines } from '@/utils/text/words'

describe('normalizeNewlines', () => {
  it.each([
    ['a\r\nb', 'a\nb'],
    ['a\rb', 'a\nb'],
    ['a\nb', 'a\nb'],
    ['a\r\n\rb\n', 'a\n\nb\n'],
    ['', ''],
  ])('%j → %j', (input, expected) => {
    expect(normalizeNewlines(input)).toBe(expected)
  })
})

describe('splitWords', () => {
  it.each([
    ['', []],
    ['   ', []],
    ['hello world', ['hello', 'world']],
    ['hello   world\tfoo\nbar', ['hello', 'world', 'foo', 'bar']],
    ['hello_world', ['hello', 'world']],
    ['hello-world', ['hello', 'world']],
    ['__foo__--bar--', ['foo', 'bar']],
    ['fooBarBaz', ['foo', 'Bar', 'Baz']],
    ['FooBarBaz', ['Foo', 'Bar', 'Baz']],
    ['XMLHttpRequest', ['XML', 'Http', 'Request']],
    ['getHTMLElement', ['get', 'HTML', 'Element']],
    ['v2Beta', ['v2', 'Beta']],
    ['ALLCAPS', ['ALLCAPS']],
    ['élan vitalÉté', ['élan', 'vital', 'Été']],
    ['straße groß', ['straße', 'groß']],
    ['hello 😀 world', ['hello', 'world']],
    ['hello, world. (again)!', ['hello', 'world', 'again']],
    ['a.b_c-d', ['a', 'b', 'c', 'd']],
    ['日本語 テキスト', ['日本語', 'テキスト']],
  ])('%j → %j', (input, expected) => {
    expect(splitWords(input)).toEqual(expected)
  })
})

describe('transformLines', () => {
  const identity = (lines: string[]) => lines

  it('returns empty for empty input', () => {
    expect(transformLines('', identity)).toBe('')
  })

  it('passes lines through and preserves a trailing newline', () => {
    expect(transformLines('a\nb', identity)).toBe('a\nb')
    expect(transformLines('a\nb\n', identity)).toBe('a\nb\n')
  })

  it('normalises crlf', () => {
    expect(transformLines('a\r\nb\r\n', identity)).toBe('a\nb\n')
  })

  it('returns empty when fn drops every line', () => {
    expect(transformLines('a\nb\n', () => [])).toBe('')
  })

  it('applies fn', () => {
    expect(transformLines('a\nb', (lines) => lines.map((l) => l.toUpperCase()))).toBe('A\nB')
  })
})

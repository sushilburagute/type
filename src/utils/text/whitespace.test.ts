import { describe, it, expect } from 'vitest'
import { collapseSpaces, removeLineBreaks, trimText } from '@/utils/text/whitespace'

describe('trimText', () => {
  it.each([
    ['', ''],
    ['   ', ''],
    ['\n\n\n', ''],
    ['hello', 'hello'],
    ['hello   ', 'hello'],
    ['hello \t', 'hello'],
    ['  hello', '  hello'],
    ['\n\nhello\n\n', 'hello'],
    ['\n  \nhello  \nworld\t\n \n', 'hello\nworld'],
    ['a\n\n\nb', 'a\n\n\nb'],
    ['a\r\nb  \r\n', 'a\nb'],
  ])('%j → %j', (input, expected) => {
    expect(trimText(input)).toBe(expected)
    expect(trimText(expected)).toBe(expected)
  })
})

describe('collapseSpaces', () => {
  it.each([
    ['', ''],
    ['a b', 'a b'],
    ['a    b', 'a b'],
    ['a\t\tb', 'a b'],
    ['a \t b', 'a b'],
    ['  a  b  ', ' a b '],
    ['a  b\nc   d', 'a b\nc d'],
    ['a\n\n\nb', 'a\n\n\nb'],
    ['a  b\r\nc', 'a b\nc'],
  ])('%j → %j', (input, expected) => {
    expect(collapseSpaces(input)).toBe(expected)
    expect(collapseSpaces(expected)).toBe(expected)
  })
})

describe('removeLineBreaks', () => {
  it.each([
    ['', ''],
    ['single', 'single'],
    ['a\nb', 'a b'],
    ['a\n\n\nb', 'a b'],
    ['a \n b', 'a b'],
    ['a\r\nb\rc', 'a b c'],
    ['a\nb\n', 'a b'],
    ['\n\na', 'a'],
    ['a  b\nc', 'a b c'],
  ])('%j → %j', (input, expected) => {
    expect(removeLineBreaks(input)).toBe(expected)
    expect(removeLineBreaks(expected)).toBe(expected)
  })
})

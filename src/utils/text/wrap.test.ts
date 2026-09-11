import { describe, it, expect } from 'vitest'
import { addLineNumbers, dedentText, indentText, wrapInBackticks, wrapInQuotes } from '@/utils/text/wrap'

describe('wrapInQuotes', () => {
  it.each([
    ['', ''],
    ['a', '"a"'],
    ['a\nb', '"a"\n"b"'],
    ['a\nb\n', '"a"\n"b"\n'],
    ['a\n\nb', '"a"\n\n"b"'],
    ['a\n  \nb', '"a"\n  \n"b"'],
    ['say "hi"', '"say \\"hi\\""'],
    ['a\r\nb', '"a"\n"b"'],
  ])('%j → %j', (input, expected) => {
    expect(wrapInQuotes(input)).toBe(expected)
  })
})

describe('wrapInBackticks', () => {
  it.each([
    ['', ''],
    ['a', '`a`'],
    ['a\nb', '`a`\n`b`'],
    ['a\nb\n', '`a`\n`b`\n'],
    ['a\n\nb', '`a`\n\n`b`'],
    ['a\n \nb', '`a`\n \n`b`'],
  ])('%j → %j', (input, expected) => {
    expect(wrapInBackticks(input)).toBe(expected)
  })
})

describe('addLineNumbers', () => {
  it.each([
    ['', ''],
    ['a', '1. a'],
    ['a\nb\nc', '1. a\n2. b\n3. c'],
    ['a\nb\n', '1. a\n2. b\n'],
    ['a\n\nb', '1. a\n2.\n3. b'],
  ])('%j → %j', (input, expected) => {
    expect(addLineNumbers(input)).toBe(expected)
  })

  it('pads numbers to the width of the largest one', () => {
    const input = Array.from({ length: 10 }, (_, i) => `l${i + 1}`).join('\n')
    const lines = addLineNumbers(input).split('\n')
    expect(lines[0]).toBe(' 1. l1')
    expect(lines[8]).toBe(' 9. l9')
    expect(lines[9]).toBe('10. l10')
  })

  it('pads to three digits past 99 lines', () => {
    const input = Array.from({ length: 100 }, () => 'x').join('\n')
    const lines = addLineNumbers(input).split('\n')
    expect(lines[0]).toBe('  1. x')
    expect(lines[99]).toBe('100. x')
  })
})

describe('indentText', () => {
  it.each([
    ['', ''],
    ['a', '  a'],
    ['a\nb', '  a\n  b'],
    ['a\nb\n', '  a\n  b\n'],
    ['a\n\nb', '  a\n\n  b'],
    ['a\n \nb', '  a\n \n  b'],
    ['  a', '    a'],
  ])('%j → %j', (input, expected) => {
    expect(indentText(input)).toBe(expected)
  })
})

describe('dedentText', () => {
  it.each([
    ['', ''],
    ['a', 'a'],
    ['  a', 'a'],
    ['  a\n  b', 'a\nb'],
    ['  a\n    b', 'a\n  b'],
    ['    a\n  b', '  a\nb'],
    ['  a\nb', '  a\nb'],
    ['  a\n\n  b', 'a\n\nb'],
    ['  a\n \n  b', 'a\n \nb'],
    ['    a\n      \n    b', 'a\n  \nb'],
    ['\ta\n\tb', 'a\nb'],
    ['\ta\n  b', '\ta\n  b'],
    ['\t  a\n\t b', ' a\nb'],
    ['  a\n  b\n', 'a\nb\n'],
    ['\n\n', '\n\n'],
    ['   ', '   '],
  ])('%j → %j', (input, expected) => {
    expect(dedentText(input)).toBe(expected)
    expect(dedentText(expected)).toBe(expected)
  })

  it('undoes indentText', () => {
    const original = 'a\n  b\n\nc\n'
    expect(dedentText(indentText(original))).toBe(original)
  })
})

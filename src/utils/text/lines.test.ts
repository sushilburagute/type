import { describe, it, expect } from 'vitest'
import { dedupeLines, removeEmptyLines, reverseLines, sortLinesAsc, sortLinesDesc } from '@/utils/text/lines'

describe('removeEmptyLines', () => {
  it.each([
    ['', ''],
    ['\n\n', ''],
    ['  \n\t\n', ''],
    ['a', 'a'],
    ['a\n\nb', 'a\nb'],
    ['a\n  \nb', 'a\nb'],
    ['\na\n\nb\n', 'a\nb\n'],
    ['a\r\n\r\nb', 'a\nb'],
  ])('%j → %j', (input, expected) => {
    expect(removeEmptyLines(input)).toBe(expected)
    expect(removeEmptyLines(expected)).toBe(expected)
  })
})

describe('sortLinesAsc', () => {
  it.each([
    ['', ''],
    ['b\na\nc', 'a\nb\nc'],
    ['b\na\nc\n', 'a\nb\nc\n'],
    ['file10\nfile2\nfile1', 'file1\nfile2\nfile10'],
    ['Banana\napple\nCherry', 'apple\nBanana\nCherry'],
    ['b\n\na', '\na\nb'],
    ['é\nz\na', 'a\né\nz'],
  ])('%j → %j', (input, expected) => {
    expect(sortLinesAsc(input)).toBe(expected)
    expect(sortLinesAsc(expected)).toBe(expected)
  })

  it('does not mutate a stable order of case-equal lines', () => {
    expect(sortLinesAsc('a\nA\na')).toBe('a\nA\na')
  })
})

describe('sortLinesDesc', () => {
  it.each([
    ['', ''],
    ['b\na\nc', 'c\nb\na'],
    ['b\na\nc\n', 'c\nb\na\n'],
    ['file1\nfile2\nfile10', 'file10\nfile2\nfile1'],
    ['apple\nBanana\nCherry', 'Cherry\nBanana\napple'],
    ['\na\nb', 'b\na\n'],
  ])('%j → %j', (input, expected) => {
    expect(sortLinesDesc(input)).toBe(expected)
    expect(sortLinesDesc(expected)).toBe(expected)
  })
})

describe('dedupeLines', () => {
  it.each([
    ['', ''],
    ['a', 'a'],
    ['a\na', 'a'],
    ['a\nb\na\nc\nb', 'a\nb\nc'],
    ['a\nA', 'a\nA'],
    ['a\na\n', 'a\n'],
    ['\n\na\n', '\na\n'],
    ['a \na', 'a \na'],
  ])('%j → %j', (input, expected) => {
    expect(dedupeLines(input)).toBe(expected)
    expect(dedupeLines(expected)).toBe(expected)
  })
})

describe('reverseLines', () => {
  it.each([
    ['', ''],
    ['a', 'a'],
    ['a\nb\nc', 'c\nb\na'],
    ['a\nb\nc\n', 'c\nb\na\n'],
    ['a\n\nb', 'b\n\na'],
    ['a\r\nb', 'b\na'],
  ])('%j → %j', (input, expected) => {
    expect(reverseLines(input)).toBe(expected)
  })

  it('is its own inverse', () => {
    expect(reverseLines(reverseLines('x\ny\nz\n'))).toBe('x\ny\nz\n')
  })
})

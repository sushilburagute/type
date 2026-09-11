import { describe, it, expect } from 'vitest'
import {
  toCamelCase,
  toKebabCase,
  toLowerCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpperCase,
} from '@/utils/text/case'

const UNICODE_SAMPLES = ['', 'straße', 'é É', '😀 hi 😀', '日本語 テキスト', 'mixed ßÉ😀日本']

const ALL = { toLowerCase, toUpperCase, toTitleCase, toSentenceCase, toCamelCase, toSnakeCase, toKebabCase }

describe('case transforms', () => {
  describe.each(Object.entries(ALL))('%s', (_name, fn) => {
    it.each(UNICODE_SAMPLES)('does not throw on %j', (sample) => {
      expect(() => fn(sample)).not.toThrow()
    })

    it('returns empty for empty input', () => {
      expect(fn('')).toBe('')
    })
  })
})

describe('toLowerCase', () => {
  it.each([
    ['Hello World', 'hello world'],
    ['ÉCOLE', 'école'],
    ['a\nB', 'a\nb'],
  ])('%j → %j', (input, expected) => {
    expect(toLowerCase(input)).toBe(expected)
    expect(toLowerCase(expected)).toBe(expected)
  })
})

describe('toUpperCase', () => {
  it.each([
    ['Hello World', 'HELLO WORLD'],
    ['école', 'ÉCOLE'],
    ['a\nb', 'A\nB'],
  ])('%j → %j', (input, expected) => {
    expect(toUpperCase(input)).toBe(expected)
    expect(toUpperCase(expected)).toBe(expected)
  })
})

describe('toTitleCase', () => {
  it.each([
    ['hello world', 'Hello World'],
    ['HELLO WORLD', 'Hello World'],
    ['hello   world', 'Hello   World'],
    ['hello\nworld\n', 'Hello\nWorld\n'],
    ['  leading space', '  Leading Space'],
    ["don't stop", "Don't Stop"],
    ['(parens) and-dash', '(Parens) And-dash'],
    ['123abc 4th', '123abc 4th'],
    ['élan vital', 'Élan Vital'],
    ['😀 smile', '😀 Smile'],
  ])('%j → %j', (input, expected) => {
    expect(toTitleCase(input)).toBe(expected)
    expect(toTitleCase(expected)).toBe(expected)
  })
})

describe('toSentenceCase', () => {
  it.each([
    ['hello world', 'Hello world'],
    ['HELLO WORLD. THIS IS A TEST! really? yes.', 'Hello world. This is a test! Really? Yes.'],
    ['one.  two', 'One.  Two'],
    ['one...\ntwo', 'One...\nTwo'],
    ['first line\nsecond line\n  indented line', 'First line\nSecond line\n  Indented line'],
    ['e.g. version 3.5 works', 'E.g. Version 3.5 works'],
    ['i think i am. i said i.', 'I think I am. I said I.'],
    ["i'm here and i'll stay", "I'm here and I'll stay"],
    ['i', 'I'],
    ['  i', '  I'],
    ['hi i', 'Hi I'],
    ['a.i. is fine', 'A.i. Is fine'],
    ['élan. été', 'Élan. Été'],
    ['\nfoo', '\nFoo'],
    ['😀 hi', '😀 hi'],
  ])('%j → %j', (input, expected) => {
    expect(toSentenceCase(input)).toBe(expected)
    expect(toSentenceCase(expected)).toBe(expected)
  })
})

describe('toCamelCase', () => {
  it.each([
    ['hello world', 'helloWorld'],
    ['Hello World', 'helloWorld'],
    ['hello_world', 'helloWorld'],
    ['hello-world', 'helloWorld'],
    ['helloWorld', 'helloWorld'],
    ['HelloWorld', 'helloWorld'],
    ['XMLHttpRequest', 'xmlHttpRequest'],
    ['  padded  ', 'padded'],
    ['single', 'single'],
    ['one two\nthree four', 'oneTwo\nthreeFour'],
    ['a\r\nb c', 'a\nbC'],
    ['\n\n', '\n\n'],
    ['élan vital', 'élanVital'],
    ['日本語 テキスト', '日本語テキスト'],
  ])('%j → %j', (input, expected) => {
    expect(toCamelCase(input)).toBe(expected)
    expect(toCamelCase(expected)).toBe(expected)
  })
})

describe('toSnakeCase', () => {
  it.each([
    ['hello world', 'hello_world'],
    ['helloWorld', 'hello_world'],
    ['HelloWorld', 'hello_world'],
    ['hello-world', 'hello_world'],
    ['XMLHttpRequest', 'xml_http_request'],
    ['  padded  ', 'padded'],
    ['one two\nthree four', 'one_two\nthree_four'],
    ['élan vital', 'élan_vital'],
  ])('%j → %j', (input, expected) => {
    expect(toSnakeCase(input)).toBe(expected)
    expect(toSnakeCase(expected)).toBe(expected)
  })
})

describe('toKebabCase', () => {
  it.each([
    ['hello world', 'hello-world'],
    ['helloWorld', 'hello-world'],
    ['HelloWorld', 'hello-world'],
    ['hello_world', 'hello-world'],
    ['XMLHttpRequest', 'xml-http-request'],
    ['  padded  ', 'padded'],
    ['one two\nthree four', 'one-two\nthree-four'],
    ['élan vital', 'élan-vital'],
  ])('%j → %j', (input, expected) => {
    expect(toKebabCase(input)).toBe(expected)
    expect(toKebabCase(expected)).toBe(expected)
  })
})

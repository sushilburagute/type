import { describe, it, expect } from 'vitest'
import { FormatError } from '@/types/format'
import { base64Decode, base64Encode, jsonMinify, jsonPretty, urlDecode, urlEncode } from '@/utils/text/encode'

const ALL = { urlEncode, urlDecode, base64Encode, base64Decode, jsonPretty, jsonMinify }

describe('encode transforms', () => {
  describe.each(Object.entries(ALL))('%s', (_name, fn) => {
    it('returns empty for empty input', () => {
      expect(fn('')).toBe('')
    })
  })
})

describe('urlEncode', () => {
  it.each([
    ['hello world', 'hello%20world'],
    ['a&b=c?d', 'a%26b%3Dc%3Fd'],
    ["safe-_.!~*'()", "safe-_.!~*'()"],
    ['é', '%C3%A9'],
    ['😀', '%F0%9F%98%80'],
    ['a\nb', 'a%0Ab'],
  ])('%j → %j', (input, expected) => {
    expect(urlEncode(input)).toBe(expected)
  })

  it('throws FormatError on a lone surrogate', () => {
    expect(() => urlEncode('\uD800')).toThrow(FormatError)
    expect(() => urlEncode('\uD800')).toThrow('not valid text')
  })
})

describe('urlDecode', () => {
  it.each([
    ['hello%20world', 'hello world'],
    ['a%26b%3Dc%3Fd', 'a&b=c?d'],
    ['%C3%A9', 'é'],
    ['%F0%9F%98%80', '😀'],
    ['plain', 'plain'],
    ['a+b', 'a+b'],
  ])('%j → %j', (input, expected) => {
    expect(urlDecode(input)).toBe(expected)
  })

  it.each(['%', '%2', '%zz', '%C3'])('throws FormatError on %j', (input) => {
    expect(() => urlDecode(input)).toThrow(FormatError)
    expect(() => urlDecode(input)).toThrow('not valid url encoding')
  })

  it('round-trips', () => {
    const text = 'héllo wörld 😀 &=?/#'
    expect(urlDecode(urlEncode(text))).toBe(text)
  })
})

describe('base64Encode', () => {
  it.each([
    ['hello', 'aGVsbG8='],
    ['hello world', 'aGVsbG8gd29ybGQ='],
    ['é', 'w6k='],
    ['😀', '8J+YgA=='],
    ['日本語', '5pel5pys6Kqe'],
    ['a\nb', 'YQpi'],
  ])('%j → %j', (input, expected) => {
    expect(base64Encode(input)).toBe(expected)
  })

  it('handles input larger than one chunk', () => {
    const big = 'x'.repeat(100_000)
    const encoded = base64Encode(big)
    expect(encoded.length).toBe(Math.ceil(100_000 / 3) * 4)
    expect(base64Decode(encoded)).toBe(big)
  })
})

describe('base64Decode', () => {
  it.each([
    ['aGVsbG8=', 'hello'],
    ['aGVsbG8', 'hello'],
    ['w6k=', 'é'],
    ['8J+YgA==', '😀'],
    ['8J-YgA==', '😀'],
    ['5pel5pys6Kqe', '日本語'],
    ['YQpi', 'a\nb'],
    [' aGVs bG8= ', 'hello'],
    ['Pz8_', '???'],
  ])('%j → %j', (input, expected) => {
    expect(base64Decode(input)).toBe(expected)
  })

  it.each(['not base64!', 'a', '@@@@', '/w=='])('throws FormatError on %j', (input) => {
    expect(() => base64Decode(input)).toThrow(FormatError)
    expect(() => base64Decode(input)).toThrow('not valid base64')
  })

  it('round-trips', () => {
    const text = 'héllo wörld 😀 日本語\n\ttabs'
    expect(base64Decode(base64Encode(text))).toBe(text)
  })
})

describe('jsonPretty', () => {
  it.each([
    ['{}', '{}'],
    ['[]', '[]'],
    ['null', 'null'],
    ['"str"', '"str"'],
    [
      '{"a":1,"b":[1,2,{"c":true}]}',
      '{\n  "a": 1,\n  "b": [\n    1,\n    2,\n    {\n      "c": true\n    }\n  ]\n}',
    ],
    ['  {"a" : 1}  ', '{\n  "a": 1\n}'],
    ['{"é":"😀"}', '{\n  "é": "😀"\n}'],
  ])('%j → %j', (input, expected) => {
    expect(jsonPretty(input)).toBe(expected)
    expect(jsonPretty(expected)).toBe(expected)
  })

  it.each(['{', '{a:1}', "{'a':1}", 'undefined', '   ', 'nope'])('throws FormatError on %j', (input) => {
    expect(() => jsonPretty(input)).toThrow(FormatError)
    expect(() => jsonPretty(input)).toThrow('not valid json')
  })
})

describe('jsonMinify', () => {
  it.each([
    ['{}', '{}'],
    ['{ "a" : 1 }', '{"a":1}'],
    ['{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}', '{"a":1,"b":[1,2]}'],
    ['[ 1 , 2 ]', '[1,2]'],
  ])('%j → %j', (input, expected) => {
    expect(jsonMinify(input)).toBe(expected)
    expect(jsonMinify(expected)).toBe(expected)
  })

  it.each(['{', '[1,]', 'nope'])('throws FormatError on %j', (input) => {
    expect(() => jsonMinify(input)).toThrow(FormatError)
    expect(() => jsonMinify(input)).toThrow('not valid json')
  })

  it('inverts jsonPretty', () => {
    const minified = '{"a":[1,2,{"b":null}],"c":"d"}'
    expect(jsonMinify(jsonPretty(minified))).toBe(minified)
  })
})

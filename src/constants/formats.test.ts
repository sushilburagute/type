import { describe, it, expect } from 'vitest'
import { FORMATS, FORMAT_GROUPS, getFormat, getFormatsByGroup } from '@/constants/formats'
import { SHORTCUTS } from '@/constants/shortcuts'

describe('FORMATS', () => {
  it('has unique ids', () => {
    const ids = FORMATS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses kebab-case ids', () => {
    for (const format of FORMATS) expect(format.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('has lowercase labels', () => {
    for (const format of FORMATS) expect(format.label).toBe(format.label.toLowerCase())
  })

  it('has a function for every format', () => {
    for (const format of FORMATS) expect(typeof format.fn).toBe('function')
  })

  it('has lowercase keywords when present', () => {
    for (const format of FORMATS) {
      for (const keyword of format.keywords ?? []) expect(keyword).toBe(keyword.toLowerCase())
    }
  })

  it('references only known shortcut ids, each at most once', () => {
    const shortcutIds = new Set(SHORTCUTS.map((s) => s.id))
    const used = FORMATS.flatMap((f) => (f.shortcut ? [f.shortcut] : []))
    for (const id of used) expect(shortcutIds.has(id)).toBe(true)
    expect(new Set(used).size).toBe(used.length)
  })

  it('wires the four shortcut formats', () => {
    expect(getFormat('uppercase')?.shortcut).toBe('uppercase')
    expect(getFormat('lowercase')?.shortcut).toBe('lowercase')
    expect(getFormat('title-case')?.shortcut).toBe('title-case')
    expect(getFormat('json-pretty')?.shortcut).toBe('json-pretty')
  })

  it('only uses declared groups', () => {
    const groupIds = new Set(FORMAT_GROUPS.map((g) => g.id))
    for (const format of FORMATS) expect(groupIds.has(format.group)).toBe(true)
  })

  it('contains every expected id', () => {
    expect(FORMATS.map((f) => f.id)).toEqual([
      'lowercase',
      'uppercase',
      'title-case',
      'sentence-case',
      'camel-case',
      'snake-case',
      'kebab-case',
      'trim',
      'collapse-spaces',
      'remove-empty-lines',
      'remove-line-breaks',
      'sort-asc',
      'sort-desc',
      'dedupe-lines',
      'reverse-lines',
      'wrap-quotes',
      'wrap-backticks',
      'line-numbers',
      'indent',
      'dedent',
      'url-encode',
      'url-decode',
      'base64-encode',
      'base64-decode',
      'json-pretty',
      'json-minify',
    ])
  })

  it('every fn returns empty for empty input', () => {
    for (const format of FORMATS) expect(format.fn('')).toBe('')
  })
})

describe('FORMAT_GROUPS', () => {
  it('has unique ids and lowercase labels', () => {
    const ids = FORMAT_GROUPS.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const group of FORMAT_GROUPS) expect(group.label).toBe(group.label.toLowerCase())
  })
})

describe('getFormat', () => {
  it('returns the format by id', () => {
    expect(getFormat('uppercase')?.label).toBe('uppercase')
    expect(getFormat('uppercase')?.fn('abc')).toBe('ABC')
  })

  it('returns undefined for unknown ids', () => {
    expect(getFormat('nope')).toBeUndefined()
  })
})

describe('getFormatsByGroup', () => {
  it('returns only formats of that group', () => {
    for (const group of FORMAT_GROUPS) {
      const formats = getFormatsByGroup(group.id)
      expect(formats.length).toBeGreaterThan(0)
      for (const format of formats) expect(format.group).toBe(group.id)
    }
  })

  it('covers every format exactly once across all groups', () => {
    const all = FORMAT_GROUPS.flatMap((g) => getFormatsByGroup(g.id)).map((f) => f.id)
    expect(all.length).toBe(FORMATS.length)
    expect(new Set(all).size).toBe(FORMATS.length)
  })
})

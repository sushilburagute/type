import { describe, expect, it } from 'vitest'
import { migrateEditors, migrateSettings } from '@/store/migrations'
import { type EditorDoc } from '@/types/editor'

describe('store migrations', () => {
  it('passes settings through for legacy, current, and missing values', () => {
    const settings = { theme: 'dark', accent: 'red' }
    expect(migrateSettings(settings, 0)).toBe(settings)
    expect(migrateSettings(settings, 1)).toBe(settings)
    expect(migrateSettings(null, 1)).toEqual({})
  })

  it('fills missing editor fields with safe defaults', () => {
    expect(migrateEditors(null, 1)).toEqual({ editors: {}, order: [], activeEditorId: null })
    expect(migrateEditors({ editors: {}, order: ['missing'] }, 1)).toEqual({
      editors: {},
      order: ['missing'],
      activeEditorId: null,
    })
  })

  it('adds a revision counter to v0 documents without changing existing revisions', () => {
    const old = {
      id: 'old',
      title: 'old',
      content: 'text',
      createdAt: 1,
      updatedAt: 1,
    } as EditorDoc
    const current = { ...old, id: 'current', rev: 7 }
    const migrated = migrateEditors(
      { editors: { old, current }, order: ['old', 'current'], activeEditorId: 'old' },
      0,
    )

    expect(migrated.editors.old?.rev).toBe(0)
    expect(migrated.editors.current?.rev).toBe(7)
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DEFAULT_TITLE,
  createEditorDoc,
  editorsStorage,
  selectActiveId,
  selectContent,
  selectEditor,
  selectEditorCount,
  selectOrder,
  useEditorsStore,
} from '@/store/editors.store'
import { useUiStore } from '@/store/ui.store'
import { MAX_EDITORS } from '@/constants/limits'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { resetStores } from '@/test/render'

const store = () => useEditorsStore.getState()
const first = () => store().order[0]!
const doc = (id: string) => store().editors[id]!

describe('editors store', () => {
  beforeEach(() => {
    resetStores()
  })

  describe('createEditorDoc', () => {
    it('builds a fresh doc with defaults', () => {
      const d = createEditorDoc()
      expect(d.title).toBe(DEFAULT_TITLE)
      expect(d.content).toBe('')
      expect(d.rev).toBe(0)
      expect(d.createdAt).toBe(d.updatedAt)
      expect(d.id).toBeTruthy()
    })

    it('accepts an initial title and content', () => {
      const d = createEditorDoc({ title: 'notes', content: 'hi' })
      expect(d.title).toBe('notes')
      expect(d.content).toBe('hi')
    })
  })

  describe('addEditor', () => {
    it('returns the id, appends to order and makes it active', () => {
      const id = store().addEditor()
      expect(id).toBeTypeOf('string')
      expect(store().order).toEqual([first(), id])
      expect(store().activeEditorId).toBe(id)
      expect(store().editors[id!]).toBeDefined()
    })

    it('passes initial values through', () => {
      const id = store().addEditor({ title: 'draft', content: 'x' })!
      expect(doc(id).title).toBe('draft')
      expect(doc(id).content).toBe('x')
    })

    it('returns null and does nothing at MAX_EDITORS', () => {
      for (let i = 1; i < MAX_EDITORS; i++) expect(store().addEditor()).not.toBeNull()
      expect(store().order).toHaveLength(MAX_EDITORS)
      expect(store().addEditor()).toBeNull()
      expect(store().order).toHaveLength(MAX_EDITORS)
    })
  })

  describe('removeEditor', () => {
    it('moves active to the next neighbour when the active editor is removed', () => {
      const a = first()
      const b = store().addEditor()!
      const c = store().addEditor()!
      store().setActive(b)
      store().removeEditor(b)
      expect(store().order).toEqual([a, c])
      expect(store().activeEditorId).toBe(c)
      expect(store().editors[b]).toBeUndefined()
    })

    it('moves active to the previous neighbour when the last editor is removed', () => {
      const a = first()
      const b = store().addEditor()!
      expect(store().activeEditorId).toBe(b)
      store().removeEditor(b)
      expect(store().order).toEqual([a])
      expect(store().activeEditorId).toBe(a)
    })

    it('keeps the active editor when a different one is removed', () => {
      const a = first()
      const b = store().addEditor()!
      store().setActive(a)
      store().removeEditor(b)
      expect(store().activeEditorId).toBe(a)
    })

    it('recreates a default editor when the last one is removed', () => {
      const a = first()
      store().removeEditor(a)
      expect(store().order).toHaveLength(1)
      const id = first()
      expect(id).not.toBe(a)
      expect(store().activeEditorId).toBe(id)
      expect(doc(id).title).toBe(DEFAULT_TITLE)
      expect(doc(id).content).toBe('')
    })

    it('ignores unknown ids', () => {
      const before = store()
      store().removeEditor('nope')
      expect(store().order).toEqual(before.order)
      expect(store().editors).toBe(before.editors)
    })
  })

  describe('setContent', () => {
    it('updates content and updatedAt without bumping rev', () => {
      vi.useFakeTimers()
      const id = first()
      const before = doc(id)
      vi.setSystemTime(before.updatedAt + 5_000)
      store().setContent(id, 'hello')
      const after = doc(id)
      expect(after.content).toBe('hello')
      expect(after.rev).toBe(before.rev)
      expect(after.updatedAt).toBeGreaterThan(before.updatedAt)
    })

    it('is a no-op for the same content', () => {
      const id = first()
      store().setContent(id, 'same')
      const before = store().editors
      store().setContent(id, 'same')
      expect(store().editors).toBe(before)
    })

    it('is a no-op for an unknown id', () => {
      const before = store().editors
      store().setContent('nope', 'x')
      expect(store().editors).toBe(before)
    })
  })

  describe('replaceContent', () => {
    it('sets content and bumps rev', () => {
      const id = first()
      store().replaceContent(id, 'a')
      expect(doc(id).content).toBe('a')
      expect(doc(id).rev).toBe(1)
      store().replaceContent(id, 'a')
      expect(doc(id).rev).toBe(2)
    })

    it('is a no-op for an unknown id', () => {
      const before = store().editors
      store().replaceContent('nope', 'x')
      expect(store().editors).toBe(before)
    })
  })

  describe('setTitle', () => {
    it('trims and lowercases', () => {
      const id = first()
      store().setTitle(id, '  My Notes ')
      expect(doc(id).title).toBe('my notes')
    })

    it('falls back to the default title when empty', () => {
      const id = first()
      store().setTitle(id, 'x')
      store().setTitle(id, '   ')
      expect(doc(id).title).toBe(DEFAULT_TITLE)
    })

    it('is a no-op when unchanged', () => {
      const id = first()
      const before = store().editors
      store().setTitle(id, DEFAULT_TITLE.toUpperCase())
      expect(store().editors).toBe(before)
    })

    it('is a no-op for an unknown id', () => {
      const before = store().editors
      store().setTitle('nope', 'x')
      expect(store().editors).toBe(before)
    })
  })

  describe('setActive', () => {
    it('sets a known id', () => {
      const a = first()
      const b = store().addEditor()!
      store().setActive(a)
      expect(store().activeEditorId).toBe(a)
      store().setActive(b)
      expect(store().activeEditorId).toBe(b)
    })

    it('ignores unknown ids', () => {
      const a = first()
      store().setActive('nope')
      expect(store().activeEditorId).toBe(a)
    })
  })

  describe('applyFormat', () => {
    it('applies uppercase and bumps rev', () => {
      const id = first()
      store().setContent(id, 'hello')
      expect(store().applyFormat(id, 'uppercase')).toBe(true)
      expect(doc(id).content).toBe('HELLO')
      expect(doc(id).rev).toBe(1)
    })

    it('returns false for an unknown format or editor', () => {
      const id = first()
      expect(store().applyFormat(id, 'nope')).toBe(false)
      expect(store().applyFormat('nope', 'uppercase')).toBe(false)
    })

    it('returns false and toasts the FormatError message for invalid json', () => {
      const id = first()
      store().setContent(id, '{not json')
      expect(store().applyFormat(id, 'json-pretty')).toBe(false)
      expect(doc(id).content).toBe('{not json')
      expect(doc(id).rev).toBe(0)
      expect(useUiStore.getState().toasts.map((t) => t.message)).toEqual(['not valid json'])
    })

    it('does not bump rev when the output equals the input', () => {
      const id = first()
      store().setContent(id, 'HELLO')
      expect(store().applyFormat(id, 'uppercase')).toBe(true)
      expect(doc(id).rev).toBe(0)
    })
  })

  describe('clearContent', () => {
    it('clears non-empty content with a rev bump', () => {
      const id = first()
      store().setContent(id, 'abc')
      store().clearContent(id)
      expect(doc(id).content).toBe('')
      expect(doc(id).rev).toBe(1)
    })

    it('is a no-op when already empty', () => {
      const id = first()
      store().clearContent(id)
      expect(doc(id).rev).toBe(0)
    })
  })

  describe('selectors', () => {
    it('read the expected slices', () => {
      const id = first()
      store().setContent(id, 'abc')
      const s = store()
      expect(selectOrder(s)).toEqual([id])
      expect(selectActiveId(s)).toBe(id)
      expect(selectEditor(id)(s)).toBe(s.editors[id])
      expect(selectContent(id)(s)).toBe('abc')
      expect(selectContent('nope')(s)).toBe('')
      expect(selectEditorCount(s)).toBe(1)
    })
  })

  describe('persistence', () => {
    it('writes the partialized state to localStorage after flush', () => {
      const id = first()
      store().setContent(id, 'persist me')
      editorsStorage.flush()
      const raw = localStorage.getItem(STORAGE_KEYS.editors)
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw!) as { state: { order: string[]; editors: Record<string, unknown> } }
      expect(parsed.state.order).toEqual([id])
      expect(parsed.state.editors[id]).toMatchObject({ content: 'persist me' })
    })

    it('debounces the write until the timer fires', () => {
      vi.useFakeTimers()
      // drain the write scheduled by resetStores so only this test's write is pending
      editorsStorage.flush()
      localStorage.clear()
      const id = first()
      store().setContent(id, 'later')
      expect(localStorage.getItem(STORAGE_KEYS.editors)).toBeNull()
      vi.advanceTimersByTime(300)
      expect(localStorage.getItem(STORAGE_KEYS.editors)).toContain('later')
    })
  })
})

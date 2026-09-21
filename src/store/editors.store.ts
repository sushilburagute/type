import { create } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import { type EditorDoc } from '@/types/editor'
import { FormatError } from '@/types/format'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { MAX_EDITORS } from '@/constants/limits'
import { getFormat } from '@/constants/formats'
import { createDebouncedStorage, safeJsonParse } from '@/utils/storage'
import { createId } from '@/utils/id'
import { EDITORS_VERSION, migrateEditors, type PersistedEditors } from '@/store/migrations'
import { useUiStore } from '@/store/ui.store'

export interface EditorsState extends PersistedEditors {
  addEditor: (initial?: Partial<Pick<EditorDoc, 'title' | 'content'>>) => string | null
  removeEditor: (id: string) => void
  /** typing path — does not bump rev */
  setContent: (id: string, content: string) => void
  /** programmatic path — bumps rev so the textarea resyncs */
  replaceContent: (id: string, content: string) => void
  setTitle: (id: string, title: string) => void
  setActive: (id: string) => void
  /** returns true when the format applied, false when it threw (toast is shown) */
  applyFormat: (id: string, formatId: string) => boolean
  clearContent: (id: string) => void
  clearAllContent: () => void
}

export const DEFAULT_TITLE = 'untitled'

export function createEditorDoc(initial?: Partial<Pick<EditorDoc, 'title' | 'content'>>): EditorDoc {
  const now = Date.now()
  return {
    id: createId(),
    title: initial?.title ?? DEFAULT_TITLE,
    content: initial?.content ?? '',
    rev: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function withDefaultEditor(state: PersistedEditors): PersistedEditors {
  if (state.order.length > 0) return state
  const doc = createEditorDoc()
  return { editors: { [doc.id]: doc }, order: [doc.id], activeEditorId: doc.id }
}

export const editorsStorage = createDebouncedStorage({
  onError: () => {
    useUiStore.getState().setStorageWarning('storage is full — your text will not persist across reloads')
  },
})

/** Defers JSON.stringify with the write, keeping multi-megabyte editor state off the typing path. */
const persistedEditorsStorage: PersistStorage<PersistedEditors> = {
  getItem(name) {
    const raw = editorsStorage.getItem(name) as string | null
    return safeJsonParse<StorageValue<PersistedEditors> | null>(raw, null)
  },
  setItem(name, value) {
    editorsStorage.setDeferredItem(name, () => JSON.stringify(value))
  },
  removeItem(name) {
    editorsStorage.removeItem(name)
  },
}

export const useEditorsStore = create<EditorsState>()(
  persist(
    (set, get) => ({
      ...withDefaultEditor({ editors: {}, order: [], activeEditorId: null }),

      addEditor: (initial) => {
        const { order } = get()
        if (order.length >= MAX_EDITORS) return null
        const doc = createEditorDoc(initial)
        set((s) => ({
          editors: { ...s.editors, [doc.id]: doc },
          order: [...s.order, doc.id],
          activeEditorId: doc.id,
        }))
        return doc.id
      },

      removeEditor: (id) => {
        set((s) => {
          if (!s.editors[id]) return s
          const rest = { ...s.editors }
          delete rest[id]
          const order = s.order.filter((x) => x !== id)
          let next: PersistedEditors = { editors: rest, order, activeEditorId: s.activeEditorId }
          if (next.activeEditorId === id) {
            const idx = s.order.indexOf(id)
            next.activeEditorId = order[Math.min(idx, order.length - 1)] ?? null
          }
          next = withDefaultEditor(next)
          return next
        })
      },

      setContent: (id, content) => {
        set((s) => {
          const doc = s.editors[id]
          if (!doc || doc.content === content) return s
          return { editors: { ...s.editors, [id]: { ...doc, content, updatedAt: Date.now() } } }
        })
      },

      replaceContent: (id, content) => {
        set((s) => {
          const doc = s.editors[id]
          if (!doc) return s
          return {
            editors: { ...s.editors, [id]: { ...doc, content, rev: doc.rev + 1, updatedAt: Date.now() } },
          }
        })
      },

      setTitle: (id, title) => {
        set((s) => {
          const doc = s.editors[id]
          if (!doc) return s
          const clean = title.trim().toLowerCase() || DEFAULT_TITLE
          if (clean === doc.title) return s
          return { editors: { ...s.editors, [id]: { ...doc, title: clean, updatedAt: Date.now() } } }
        })
      },

      setActive: (id) => {
        if (get().activeEditorId === id || !get().editors[id]) return
        set({ activeEditorId: id })
      },

      applyFormat: (id, formatId) => {
        const doc = get().editors[id]
        const format = getFormat(formatId)
        if (!doc || !format) return false
        try {
          const next = format.fn(doc.content)
          if (next !== doc.content) get().replaceContent(id, next)
          return true
        } catch (err) {
          const message = err instanceof FormatError ? err.message : 'could not apply format'
          useUiStore.getState().pushToast(message)
          return false
        }
      },

      clearContent: (id) => {
        if (get().editors[id]?.content) get().replaceContent(id, '')
      },

      clearAllContent: () => {
        set((s) => {
          if (!s.order.some((id) => Boolean(s.editors[id]?.content))) return s
          const now = Date.now()
          const editors = { ...s.editors }
          for (const id of s.order) {
            const doc = editors[id]
            if (doc?.content) editors[id] = { ...doc, content: '', rev: doc.rev + 1, updatedAt: now }
          }
          return { editors }
        })
      },
    }),
    {
      name: STORAGE_KEYS.editors,
      version: EDITORS_VERSION,
      storage: persistedEditorsStorage,
      partialize: (s) => ({ editors: s.editors, order: s.order, activeEditorId: s.activeEditorId }),
      migrate: migrateEditors,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedEditors>
        const next = withDefaultEditor({
          editors: p.editors ?? {},
          order: (p.order ?? []).filter((id) => p.editors?.[id]),
          activeEditorId: p.activeEditorId ?? null,
        })
        if (!next.activeEditorId || !next.editors[next.activeEditorId])
          next.activeEditorId = next.order[0] ?? null
        return { ...current, ...next }
      },
    },
  ),
)

/* ---- selectors (stable, cheap) ---- */
export const selectOrder = (s: EditorsState) => s.order
export const selectActiveId = (s: EditorsState) => s.activeEditorId
export const selectEditor = (id: string) => (s: EditorsState) => s.editors[id]
export const selectContent = (id: string) => (s: EditorsState) => s.editors[id]?.content ?? ''
export const selectEditorCount = (s: EditorsState) => s.order.length
export const selectHasAnyContent = (s: EditorsState) => s.order.some((id) => Boolean(s.editors[id]?.content))

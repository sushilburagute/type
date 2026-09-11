import { type EditorDoc } from '@/types/editor'

export const SETTINGS_VERSION = 1
export const EDITORS_VERSION = 1

/**
 * persisted-state migrations. each version bump gets a case here.
 * the functions receive whatever was stored (possibly from an older build) and must return the current shape.
 */
export function migrateSettings(persisted: unknown, version: number): Record<string, unknown> {
  const state = (persisted ?? {}) as Record<string, unknown>
  switch (version) {
    case 0:
      // v0 → v1: no shape change; scaffold so the pattern exists
      return state
    default:
      return state
  }
}

export interface PersistedEditors {
  editors: Record<string, EditorDoc>
  order: string[]
  activeEditorId: string | null
}

export function migrateEditors(persisted: unknown, version: number): PersistedEditors {
  const state = (persisted ?? {}) as Partial<PersistedEditors>
  const base: PersistedEditors = {
    editors: state.editors ?? {},
    order: state.order ?? [],
    activeEditorId: state.activeEditorId ?? null,
  }
  switch (version) {
    case 0:
      // v0 → v1: ensure every doc has a rev counter
      for (const doc of Object.values(base.editors)) {
        if (typeof doc.rev !== 'number') doc.rev = 0
      }
      return base
    default:
      return base
  }
}

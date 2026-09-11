import { type ShortcutDef } from '@/types/shortcut'

/**
 * single source of truth for keyboard shortcuts.
 * 'mod' = ctrl on windows/linux, cmd on mac. never override plain mod+c/v/z/a or mod+shift+v/x/z.
 */
export const SHORTCUTS: readonly ShortcutDef[] = [
  { id: 'palette', label: 'command palette', keys: 'mod+k', inEditor: true },
  { id: 'new-editor', label: 'new editor', keys: 'mod+shift+n', inEditor: true },
  { id: 'close-editor', label: 'close active editor', keys: 'mod+shift+w', inEditor: true },
  { id: 'copy', label: 'copy active editor', keys: 'mod+shift+c', inEditor: true },
  { id: 'compare', label: 'compare editors', keys: 'mod+shift+d', inEditor: true },
  { id: 'uppercase', label: 'uppercase', keys: 'mod+shift+u', inEditor: true },
  { id: 'lowercase', label: 'lowercase', keys: 'mod+shift+l', inEditor: true },
  { id: 'title-case', label: 'title case', keys: 'mod+shift+t', inEditor: true },
  { id: 'json-pretty', label: 'json pretty', keys: 'mod+shift+j', inEditor: true },
  { id: 'toggle-theme', label: 'toggle theme', keys: 'mod+/', inEditor: true },
  { id: 'focus-editor', label: 'focus editor 1–8', keys: 'alt+1…8', inEditor: true },
  { id: 'shortcuts', label: 'keyboard shortcuts', keys: '?', inEditor: false },
  { id: 'escape', label: 'close overlay', keys: 'esc', inEditor: true },
] as const

export type ShortcutId = (typeof SHORTCUTS)[number]['id']

export function getShortcut(id: ShortcutId): ShortcutDef {
  return SHORTCUTS.find((s) => s.id === id)!
}

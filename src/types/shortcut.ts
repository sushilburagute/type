export interface ShortcutDef {
  id: string
  /** lowercase description */
  label: string
  /** e.g. 'mod+shift+n' — 'mod' is ctrl on windows/linux, cmd on mac */
  keys: string
  /** whether it should fire while focus is inside a textarea/input */
  inEditor: boolean
}

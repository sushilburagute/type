export type FormatGroup = 'case' | 'lines' | 'wrap' | 'encode'

export type FormatFn = (input: string) => string

export interface FormatDef {
  id: string
  /** lowercase, shown in menus */
  label: string
  group: FormatGroup
  fn: FormatFn
  /** extra search terms for the command palette */
  keywords?: string[]
  /** shortcut id from constants/shortcuts.ts, if any */
  shortcut?: string
}

/** thrown by a format fn when the input can't be transformed (e.g. invalid json) */
export class FormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FormatError'
  }
}

export interface EditorDoc {
  id: string
  title: string
  content: string
  /** bumped only by non-typing mutations (format, clear, rehydrate) so the textarea knows to resync */
  rev: number
  createdAt: number
  updatedAt: number
}

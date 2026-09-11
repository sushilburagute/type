/** normalise `\r\n` and lone `\r` line endings to `\n` */
export function normaliseNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

/**
 * split text into lines, line-ending agnostic.
 * an empty string yields no lines, and a single trailing newline does not
 * produce a phantom empty last line (`'a\nb\n'` → `['a', 'b']`).
 */
export function splitLines(text: string): string[] {
  if (text === '') return []
  const lines = normaliseNewlines(text).split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

/** canonical form used for equality: normalised newlines, no trailing newline */
export function canonicalText(text: string): string {
  return splitLines(text).join('\n')
}

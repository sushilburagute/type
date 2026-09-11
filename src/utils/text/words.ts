/** crlf / cr → lf */
export function normalizeNewlines(input: string): string {
  return input.replace(/\r\n?/g, '\n')
}

/**
 * splits text into identifier words: anything that isn't a letter or digit separates, and camelCase /
 * PascalCase boundaries split too. `fooBarBaz` → `['foo', 'Bar', 'Baz']`, `XMLHttpRequest` → `['XML', 'Http', 'Request']`,
 * `hello, world.` → `['hello', 'world']`. empty tokens are dropped; unicode letters and digits are kept as-is.
 */
export function splitWords(input: string): string[] {
  return input
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0)
}

/**
 * runs `fn` over the lines of `input` (newlines normalised to lf) and joins the result.
 * a trailing newline is preserved; if `fn` returns no lines the result is ''.
 */
export function transformLines(input: string, fn: (lines: string[]) => string[]): string {
  const text = normalizeNewlines(input)
  if (text === '') return ''
  const trailing = text.endsWith('\n')
  const body = trailing ? text.slice(0, -1) : text
  const lines = fn(body.split('\n'))
  if (lines.length === 0) return ''
  return lines.join('\n') + (trailing ? '\n' : '')
}

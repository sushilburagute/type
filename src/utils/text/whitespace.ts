import { normalizeNewlines } from '@/utils/text/words'

/** strips trailing whitespace from every line and drops leading / trailing blank lines */
export function trimText(input: string): string {
  const lines = normalizeNewlines(input)
    .split('\n')
    .map((line) => line.replace(/\s+$/u, ''))
  let start = 0
  let end = lines.length
  while (start < end && lines[start] === '') start++
  while (end > start && lines[end - 1] === '') end--
  return lines.slice(start, end).join('\n')
}

/** runs of spaces / tabs within a line → a single space. newlines are kept. */
export function collapseSpaces(input: string): string {
  return normalizeNewlines(input).replace(/[ \t]+/g, ' ')
}

/** joins all lines with a single space and collapses any resulting double spaces */
export function removeLineBreaks(input: string): string {
  return normalizeNewlines(input).split('\n').join(' ').replace(/ {2,}/g, ' ').trim()
}

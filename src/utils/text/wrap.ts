import { transformLines } from '@/utils/text/words'

function isBlank(line: string): boolean {
  return line.trim() === ''
}

/** wraps each non-blank line in double quotes, escaping existing `"` as `\"` */
export function wrapInQuotes(input: string): string {
  return transformLines(input, (lines) =>
    lines.map((line) => (isBlank(line) ? line : `"${line.replace(/"/g, '\\"')}"`)),
  )
}

/** wraps each non-blank line in backticks */
export function wrapInBackticks(input: string): string {
  return transformLines(input, (lines) => lines.map((line) => (isBlank(line) ? line : `\`${line}\``)))
}

/** `1. text`, numbers right-aligned to the width of the largest one */
export function addLineNumbers(input: string): string {
  return transformLines(input, (lines) => {
    const width = String(lines.length).length
    return lines.map((line, index) => {
      const number = `${String(index + 1).padStart(width)}.`
      return line === '' ? number : `${number} ${line}`
    })
  })
}

/** prefixes every non-blank line with two spaces */
export function indentText(input: string): string {
  return transformLines(input, (lines) => lines.map((line) => (isBlank(line) ? line : `  ${line}`)))
}

/** removes the leading whitespace common to all non-blank lines (tabs count as-is) */
export function dedentText(input: string): string {
  return transformLines(input, (lines) => {
    let prefix: string | undefined
    for (const line of lines) {
      if (isBlank(line)) continue
      const leading = line.slice(0, line.length - line.replace(/^[ \t]+/, '').length)
      if (prefix === undefined) {
        prefix = leading
      } else {
        let i = 0
        while (i < prefix.length && i < leading.length && prefix[i] === leading[i]) i++
        prefix = prefix.slice(0, i)
      }
      if (prefix === '') break
    }
    const common = prefix ?? ''
    if (common === '') return lines
    return lines.map((line) => (line.startsWith(common) ? line.slice(common.length) : line))
  })
}

import { normalizeNewlines, splitWords } from '@/utils/text/words'

export function toLowerCase(input: string): string {
  return input.toLowerCase()
}

export function toUpperCase(input: string): string {
  return input.toUpperCase()
}

/** capitalises the first letter of every word, lowercases the rest. spacing and line breaks are kept. */
export function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/\S+/gu, (token) => token.replace(/[\p{L}\p{N}]/u, (char) => char.toUpperCase()))
}

/**
 * lowercases everything, then uppercases the first letter of each sentence
 * (start of text, start of each line, or after `.`, `!`, `?` + whitespace) and standalone `i`.
 */
export function toSentenceCase(input: string): string {
  return input
    .toLowerCase()
    .replace(
      /(^|\n|[.!?]+\s)(\s*)(\p{L})/gu,
      (_match, lead: string, gap: string, char: string) => lead + gap + char.toUpperCase(),
    )
    .replace(/(^|\s)i(?=[^\p{L}\p{N}]|$)/gu, '$1I')
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function perLine(input: string, fn: (line: string) => string): string {
  return normalizeNewlines(input).split('\n').map(fn).join('\n')
}

/** each line is converted independently: `hello world` → `helloWorld` */
export function toCamelCase(input: string): string {
  return perLine(input, (line) =>
    splitWords(line)
      .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
      .join(''),
  )
}

/** each line is converted independently: `hello world` → `hello_world` */
export function toSnakeCase(input: string): string {
  return perLine(input, (line) =>
    splitWords(line)
      .map((word) => word.toLowerCase())
      .join('_'),
  )
}

/** each line is converted independently: `hello world` → `hello-world` */
export function toKebabCase(input: string): string {
  return perLine(input, (line) =>
    splitWords(line)
      .map((word) => word.toLowerCase())
      .join('-'),
  )
}

import { type FormatDef, type FormatGroup } from '@/types/format'
import {
  toCamelCase,
  toKebabCase,
  toLowerCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpperCase,
} from '@/utils/text/case'
import { collapseSpaces, removeLineBreaks, trimText } from '@/utils/text/whitespace'
import { dedupeLines, removeEmptyLines, reverseLines, sortLinesAsc, sortLinesDesc } from '@/utils/text/lines'
import { addLineNumbers, dedentText, indentText, wrapInBackticks, wrapInQuotes } from '@/utils/text/wrap'
import { base64Decode, base64Encode, jsonMinify, jsonPretty, urlDecode, urlEncode } from '@/utils/text/encode'

export const FORMAT_GROUPS: readonly { id: FormatGroup; label: string }[] = [
  { id: 'case', label: 'case' },
  { id: 'lines', label: 'lines' },
  { id: 'wrap', label: 'wrap' },
  { id: 'encode', label: 'encode' },
]

/**
 * single source of truth for text formats. add a pure fn under utils/text, register it here,
 * and it shows up in the format menu, the command palette and (if `shortcut` is set) the shortcut map.
 */
export const FORMATS: readonly FormatDef[] = [
  // case
  {
    id: 'lowercase',
    label: 'lowercase',
    group: 'case',
    fn: toLowerCase,
    keywords: ['lower'],
    shortcut: 'lowercase',
  },
  {
    id: 'uppercase',
    label: 'uppercase',
    group: 'case',
    fn: toUpperCase,
    keywords: ['upper', 'caps'],
    shortcut: 'uppercase',
  },
  {
    id: 'title-case',
    label: 'title case',
    group: 'case',
    fn: toTitleCase,
    keywords: ['title', 'titlecase', 'capitalize'],
    shortcut: 'title-case',
  },
  { id: 'sentence-case', label: 'sentence case', group: 'case', fn: toSentenceCase, keywords: ['sentence'] },
  { id: 'camel-case', label: 'camel case', group: 'case', fn: toCamelCase, keywords: ['camel', 'camelcase'] },
  {
    id: 'snake-case',
    label: 'snake case',
    group: 'case',
    fn: toSnakeCase,
    keywords: ['snake', 'snakecase', 'underscore'],
  },
  {
    id: 'kebab-case',
    label: 'kebab case',
    group: 'case',
    fn: toKebabCase,
    keywords: ['kebab', 'kebabcase', 'dash', 'slug'],
  },

  // lines
  { id: 'trim', label: 'trim', group: 'lines', fn: trimText, keywords: ['whitespace', 'strip'] },
  {
    id: 'collapse-spaces',
    label: 'collapse spaces',
    group: 'lines',
    fn: collapseSpaces,
    keywords: ['spaces', 'whitespace'],
  },
  {
    id: 'remove-empty-lines',
    label: 'remove empty lines',
    group: 'lines',
    fn: removeEmptyLines,
    keywords: ['blank', 'empty'],
  },
  {
    id: 'remove-line-breaks',
    label: 'remove line breaks',
    group: 'lines',
    fn: removeLineBreaks,
    keywords: ['join', 'newlines'],
  },
  {
    id: 'sort-asc',
    label: 'sort a→z',
    group: 'lines',
    fn: sortLinesAsc,
    keywords: ['sort', 'ascending', 'a-z'],
  },
  {
    id: 'sort-desc',
    label: 'sort z→a',
    group: 'lines',
    fn: sortLinesDesc,
    keywords: ['sort', 'descending', 'z-a'],
  },
  {
    id: 'dedupe-lines',
    label: 'dedupe lines',
    group: 'lines',
    fn: dedupeLines,
    keywords: ['unique', 'duplicate', 'uniq'],
  },
  {
    id: 'reverse-lines',
    label: 'reverse lines',
    group: 'lines',
    fn: reverseLines,
    keywords: ['reverse', 'flip'],
  },

  // wrap
  {
    id: 'wrap-quotes',
    label: 'wrap in quotes',
    group: 'wrap',
    fn: wrapInQuotes,
    keywords: ['quote', 'quotes', 'string'],
  },
  {
    id: 'wrap-backticks',
    label: 'wrap in backticks',
    group: 'wrap',
    fn: wrapInBackticks,
    keywords: ['backtick', 'code'],
  },
  {
    id: 'line-numbers',
    label: 'line numbers',
    group: 'wrap',
    fn: addLineNumbers,
    keywords: ['number', 'numbered', 'enumerate'],
  },
  { id: 'indent', label: 'indent', group: 'wrap', fn: indentText, keywords: ['indent', 'shift right'] },
  {
    id: 'dedent',
    label: 'dedent',
    group: 'wrap',
    fn: dedentText,
    keywords: ['outdent', 'unindent', 'shift left'],
  },

  // encode
  {
    id: 'url-encode',
    label: 'url encode',
    group: 'encode',
    fn: urlEncode,
    keywords: ['url', 'uri', 'percent', 'escape'],
  },
  {
    id: 'url-decode',
    label: 'url decode',
    group: 'encode',
    fn: urlDecode,
    keywords: ['url', 'uri', 'percent', 'unescape'],
  },
  {
    id: 'base64-encode',
    label: 'base64 encode',
    group: 'encode',
    fn: base64Encode,
    keywords: ['base64', 'b64'],
  },
  {
    id: 'base64-decode',
    label: 'base64 decode',
    group: 'encode',
    fn: base64Decode,
    keywords: ['base64', 'b64'],
  },
  {
    id: 'json-pretty',
    label: 'json pretty',
    group: 'encode',
    fn: jsonPretty,
    keywords: ['json', 'format', 'beautify'],
    shortcut: 'json-pretty',
  },
  {
    id: 'json-minify',
    label: 'json minify',
    group: 'encode',
    fn: jsonMinify,
    keywords: ['json', 'compact', 'minify'],
  },
]

export function getFormat(id: string): FormatDef | undefined {
  return FORMATS.find((format) => format.id === id)
}

export function getFormatsByGroup(group: FormatGroup): FormatDef[] {
  return FORMATS.filter((format) => format.group === group)
}

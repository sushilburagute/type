import { READING_WPM } from '@/constants/limits'

export interface TextStats {
  chars: number
  words: number
  lines: number
  sentences: number
  readingMinutes: number
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu
const SENTENCE_RE = /[.!?]+(?=\s|$)/g

export function computeStats(input: string): TextStats {
  const chars = input.length
  const words = input.match(WORD_RE)?.length ?? 0
  const lines = input === '' ? 0 : input.split('\n').length
  const punctuated = input.match(SENTENCE_RE)?.length ?? 0
  const sentences = punctuated === 0 && words > 0 ? 1 : punctuated
  const readingMinutes = words === 0 ? 0 : Math.ceil(words / READING_WPM)
  return { chars, words, lines, sentences, readingMinutes }
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

/** `12 chars · 3 words · 1 line · 1 sentence · ~1 min read` — the read segment is omitted at 0 */
export function formatStats(stats: TextStats): string {
  const parts = [
    plural(stats.chars, 'char'),
    plural(stats.words, 'word'),
    plural(stats.lines, 'line'),
    plural(stats.sentences, 'sentence'),
  ]
  if (stats.readingMinutes > 0) parts.push(`~${stats.readingMinutes} min read`)
  return parts.join(' · ')
}

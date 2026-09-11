import { transformLines } from '@/utils/text/words'

const COLLATOR_OPTIONS: Intl.CollatorOptions = { numeric: true, sensitivity: 'base' }

function compareLines(a: string, b: string): number {
  return a.localeCompare(b, undefined, COLLATOR_OPTIONS)
}

/** drops lines that are empty or whitespace-only */
export function removeEmptyLines(input: string): string {
  return transformLines(input, (lines) => lines.filter((line) => line.trim() !== ''))
}

/** locale-aware, numeric-aware, case-insensitive a→z */
export function sortLinesAsc(input: string): string {
  return transformLines(input, (lines) => [...lines].sort(compareLines))
}

/** locale-aware, numeric-aware, case-insensitive z→a */
export function sortLinesDesc(input: string): string {
  return transformLines(input, (lines) => [...lines].sort((a, b) => compareLines(b, a)))
}

/** keeps the first occurrence of each line (exact match) */
export function dedupeLines(input: string): string {
  return transformLines(input, (lines) => [...new Set(lines)])
}

export function reverseLines(input: string): string {
  return transformLines(input, (lines) => [...lines].reverse())
}

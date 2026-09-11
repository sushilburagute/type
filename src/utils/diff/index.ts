export { canonicalText, normaliseNewlines, splitLines } from '@/utils/diff/splitLines'
export { pairChanges } from '@/utils/diff/pairChanges'
export {
  INTRALINE_MAX_CHANGED_RATIO,
  intraLine,
  segmentsFromChanges,
  type IntraLineResult,
} from '@/utils/diff/intraLine'
export { computeDiff, type ComputeDiffOptions } from '@/utils/diff/computeDiff'
export { toUnified } from '@/utils/diff/toUnified'
export { toSplit } from '@/utils/diff/toSplit'

import { useDeferredValue, useMemo } from 'react'
import { computeStats, type TextStats } from '@/utils/text/stats'

/** stats lag one frame behind fast typing via useDeferredValue so they never block input */
export function useTextStats(content: string): TextStats {
  const deferred = useDeferredValue(content)
  return useMemo(() => computeStats(deferred), [deferred])
}

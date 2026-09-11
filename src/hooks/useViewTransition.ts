import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { PREFERS_REDUCED_MOTION } from '@/hooks/useMediaQuery'

export interface ViewTransitionOptions {
  /** viewport origin for the circular reveal */
  x?: number
  y?: number
}

/**
 * runs a state change inside document.startViewTransition when available and motion is allowed;
 * otherwise runs it synchronously. flushSync makes react commit before the browser snapshots.
 */
export function runViewTransition(update: () => void, options: ViewTransitionOptions = {}): void {
  const reduced = typeof window !== 'undefined' && window.matchMedia(PREFERS_REDUCED_MOTION).matches
  if (typeof document === 'undefined' || !document.startViewTransition || reduced) {
    update()
    return
  }
  const root = document.documentElement
  if (options.x !== undefined && options.y !== undefined) {
    root.style.setProperty('--vt-x', `${options.x}px`)
    root.style.setProperty('--vt-y', `${options.y}px`)
  }
  document.startViewTransition(() => flushSync(update))
}

export function useViewTransition() {
  return useCallback(
    (update: () => void, options?: ViewTransitionOptions) => runViewTransition(update, options),
    [],
  )
}

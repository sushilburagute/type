import { useSyncExternalStore } from 'react'

function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
}

/** reactive matchMedia — safe under ssr/jsdom (falls back to false) */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false,
  )
}

export const PREFERS_DARK = '(prefers-color-scheme: dark)'
export const PREFERS_REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const COARSE_POINTER = '(pointer: coarse)'

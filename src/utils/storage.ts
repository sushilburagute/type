import { type StateStorage } from 'zustand/middleware'
import { STORAGE_DEBOUNCE_MS } from '@/constants/limits'

export type StorageErrorHandler = (error: unknown) => void

export interface DebouncedStorageOptions {
  /** trailing debounce per key, defaults to STORAGE_DEBOUNCE_MS */
  delayMs?: number
  /** called for every storage failure; quota errors are reported once per instance */
  onError?: StorageErrorHandler
  /** defaults to window.localStorage */
  storage?: Storage
}

export type DebouncedStorage = StateStorage & {
  flush(): void
  /** schedules expensive serialization for the end of the debounce window */
  setDeferredItem(name: string, createValue: () => string): void
}

/** true for the quota exceeded DOMException every browser throws when localStorage is full */
export function isQuotaError(e: unknown): boolean {
  return e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)
}

/** JSON.parse that never throws and treats null as missing */
export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

interface PendingWrite {
  value: string | (() => string)
  timer: ReturnType<typeof setTimeout>
}

/**
 * a zustand StateStorage that coalesces rapid writes to the same key.
 * reads are synchronous; writes are flushed on a trailing debounce, on flush(),
 * and whenever the page is hidden or unloaded so nothing is lost on tab close.
 */
export function createDebouncedStorage(options: DebouncedStorageOptions = {}): DebouncedStorage {
  const { delayMs = STORAGE_DEBOUNCE_MS, onError, storage } = options
  const pending = new Map<string, PendingWrite>()
  let quotaReported = false

  const target = (): Storage => storage ?? localStorage

  function report(e: unknown): void {
    if (isQuotaError(e)) {
      if (quotaReported) return
      quotaReported = true
    }
    onError?.(e)
  }

  function write(name: string, pendingValue: PendingWrite['value']): void {
    try {
      const value = typeof pendingValue === 'function' ? pendingValue() : pendingValue
      target().setItem(name, value)
    } catch (e) {
      report(e)
    }
  }

  function cancel(name: string): PendingWrite | undefined {
    const entry = pending.get(name)
    if (!entry) return undefined
    clearTimeout(entry.timer)
    pending.delete(name)
    return entry
  }

  function flushKey(name: string): void {
    const entry = cancel(name)
    if (entry) write(name, entry.value)
  }

  function flush(): void {
    for (const name of [...pending.keys()]) flushKey(name)
  }

  const api: DebouncedStorage = {
    getItem(name) {
      try {
        return target().getItem(name)
      } catch (e) {
        report(e)
        return null
      }
    },
    setItem(name, value) {
      cancel(name)
      const timer = setTimeout(() => flushKey(name), delayMs)
      pending.set(name, { value, timer })
    },
    setDeferredItem(name, createValue) {
      cancel(name)
      const timer = setTimeout(() => flushKey(name), delayMs)
      pending.set(name, { value: createValue, timer })
    },
    removeItem(name) {
      cancel(name)
      try {
        target().removeItem(name)
      } catch (e) {
        report(e)
      }
    },
    flush,
  }

  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
    window.addEventListener('pagehide', flush)
  }

  return api
}

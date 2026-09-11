import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createDebouncedStorage, isQuotaError, safeJsonParse } from './storage'

function quotaError(): DOMException {
  return new DOMException('quota exceeded', 'QuotaExceededError')
}

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  }
}

describe('createDebouncedStorage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('coalesces rapid writes to the same key into one trailing write', () => {
    const storage = memoryStorage()
    const setItem = vi.spyOn(storage, 'setItem')
    const s = createDebouncedStorage({ storage, delayMs: 100 })

    s.setItem('a', '1')
    s.setItem('a', '2')
    s.setItem('a', '3')
    expect(setItem).not.toHaveBeenCalled()

    vi.advanceTimersByTime(99)
    expect(setItem).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(setItem).toHaveBeenCalledWith('a', '3')
    expect(storage.getItem('a')).toBe('3')
  })

  it('defers expensive value creation and coalesces it with later writes', () => {
    const storage = memoryStorage()
    const first = vi.fn(() => 'first')
    const latest = vi.fn(() => 'latest')
    const s = createDebouncedStorage({ storage, delayMs: 100 })

    s.setDeferredItem('a', first)
    s.setDeferredItem('a', latest)
    expect(first).not.toHaveBeenCalled()
    expect(latest).not.toHaveBeenCalled()

    s.flush()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
    expect(storage.getItem('a')).toBe('latest')
  })

  it('reports deferred serialization errors without throwing', () => {
    const onError = vi.fn()
    const s = createDebouncedStorage({ storage: memoryStorage(), onError, delayMs: 10 })
    const error = new Error('serialize')

    s.setDeferredItem('a', () => {
      throw error
    })
    expect(() => s.flush()).not.toThrow()
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('uses STORAGE_DEBOUNCE_MS by default', () => {
    const storage = memoryStorage()
    const s = createDebouncedStorage({ storage })
    s.setItem('a', '1')
    vi.advanceTimersByTime(299)
    expect(storage.getItem('a')).toBeNull()
    vi.advanceTimersByTime(1)
    expect(storage.getItem('a')).toBe('1')
  })

  it('writes separate keys independently', () => {
    const storage = memoryStorage()
    const setItem = vi.spyOn(storage, 'setItem')
    const s = createDebouncedStorage({ storage, delayMs: 50 })

    s.setItem('a', '1')
    s.setItem('b', '2')
    vi.runAllTimers()

    expect(setItem).toHaveBeenCalledTimes(2)
    expect(storage.getItem('a')).toBe('1')
    expect(storage.getItem('b')).toBe('2')
  })

  it('removeItem cancels the pending write and removes immediately', () => {
    const storage = memoryStorage()
    storage.setItem('a', 'old')
    const setItem = vi.spyOn(storage, 'setItem')
    const s = createDebouncedStorage({ storage, delayMs: 50 })

    s.setItem('a', 'new')
    s.removeItem('a')
    expect(storage.getItem('a')).toBeNull()

    vi.runAllTimers()
    expect(setItem).not.toHaveBeenCalled()
    expect(storage.getItem('a')).toBeNull()
  })

  it('flush writes every pending value immediately and does not write twice', () => {
    const storage = memoryStorage()
    const setItem = vi.spyOn(storage, 'setItem')
    const s = createDebouncedStorage({ storage, delayMs: 50 })

    s.setItem('a', '1')
    s.setItem('b', '2')
    s.flush()
    expect(storage.getItem('a')).toBe('1')
    expect(storage.getItem('b')).toBe('2')

    vi.runAllTimers()
    expect(setItem).toHaveBeenCalledTimes(2)
  })

  it('flushes when the document becomes hidden but not when it becomes visible', () => {
    const storage = memoryStorage()
    const s = createDebouncedStorage({ storage, delayMs: 50 })
    s.setItem('a', '1')

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(storage.getItem('a')).toBeNull()

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(storage.getItem('a')).toBe('1')

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  })

  it('flushes on pagehide', () => {
    const storage = memoryStorage()
    const s = createDebouncedStorage({ storage, delayMs: 50 })
    s.setItem('a', '1')
    window.dispatchEvent(new Event('pagehide'))
    expect(storage.getItem('a')).toBe('1')
  })

  it('reads synchronously from the underlying storage', () => {
    const storage = memoryStorage()
    storage.setItem('a', 'x')
    const s = createDebouncedStorage({ storage })
    expect(s.getItem('a')).toBe('x')
    expect(s.getItem('missing')).toBeNull()
  })

  it('defaults to localStorage', () => {
    const s = createDebouncedStorage({ delayMs: 10 })
    s.setItem('k', 'v')
    vi.runAllTimers()
    expect(localStorage.getItem('k')).toBe('v')
    expect(s.getItem('k')).toBe('v')
    s.removeItem('k')
    expect(localStorage.getItem('k')).toBeNull()
  })

  it('returns null and reports when getItem throws', () => {
    const storage = memoryStorage()
    const err = new Error('private mode')
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw err
    })
    const onError = vi.fn()
    const s = createDebouncedStorage({ storage, onError })
    expect(s.getItem('a')).toBeNull()
    expect(onError).toHaveBeenCalledWith(err)
  })

  it('reports quota errors only once per instance', () => {
    const storage = memoryStorage()
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw quotaError()
    })
    const onError = vi.fn()
    const s = createDebouncedStorage({ storage, onError, delayMs: 10 })

    s.setItem('a', '1')
    vi.runAllTimers()
    s.setItem('a', '2')
    vi.runAllTimers()
    s.setItem('b', '3')
    s.flush()

    expect(onError).toHaveBeenCalledTimes(1)
    expect(isQuotaError(onError.mock.calls[0]?.[0])).toBe(true)
  })

  it('reports non-quota errors every time', () => {
    const storage = memoryStorage()
    const err = new Error('nope')
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw err
    })
    vi.spyOn(storage, 'removeItem').mockImplementation(() => {
      throw err
    })
    const onError = vi.fn()
    const s = createDebouncedStorage({ storage, onError, delayMs: 10 })

    s.setItem('a', '1')
    vi.runAllTimers()
    s.setItem('a', '2')
    vi.runAllTimers()
    s.removeItem('a')

    expect(onError).toHaveBeenCalledTimes(3)
    expect(onError).toHaveBeenLastCalledWith(err)
  })

  it('never throws when no onError handler is given', () => {
    const storage = memoryStorage()
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw quotaError()
    })
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('x')
    })
    const s = createDebouncedStorage({ storage, delayMs: 10 })
    expect(() => {
      s.setItem('a', '1')
      vi.runAllTimers()
    }).not.toThrow()
    expect(s.getItem('a')).toBeNull()
  })
})

describe('isQuotaError', () => {
  it('matches by name', () => {
    expect(isQuotaError(quotaError())).toBe(true)
  })

  it('matches by legacy code 22', () => {
    const e = new DOMException('full', 'QuotaExceededError')
    Object.defineProperty(e, 'name', { value: 'NS_ERROR_DOM_QUOTA_REACHED' })
    expect(e.code).toBe(22)
    expect(isQuotaError(e)).toBe(true)
  })

  it('rejects other DOMExceptions and non-DOMExceptions', () => {
    expect(isQuotaError(new DOMException('x', 'SecurityError'))).toBe(false)
    expect(isQuotaError(new Error('QuotaExceededError'))).toBe(false)
    expect(isQuotaError('QuotaExceededError')).toBe(false)
    expect(isQuotaError(null)).toBe(false)
  })
})

describe('safeJsonParse', () => {
  it('parses valid json', () => {
    expect(safeJsonParse('{"a":1}', { a: 0 })).toEqual({ a: 1 })
    expect(safeJsonParse('[1,2]', [])).toEqual([1, 2])
  })

  it('returns the fallback for null', () => {
    expect(safeJsonParse(null, 'fb')).toBe('fb')
  })

  it('returns the fallback for invalid json', () => {
    expect(safeJsonParse('{oops', 'fb')).toBe('fb')
    expect(safeJsonParse('', 'fb')).toBe('fb')
  })
})

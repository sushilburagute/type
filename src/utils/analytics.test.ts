import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  _resetAnalyticsForTests,
  initAnalyticsLazily,
  isAnalyticsEnabled,
  loadAnalytics,
  track,
} from './analytics'

const ID = 'G-TEST'

function scripts(): HTMLScriptElement[] {
  return [...document.querySelectorAll<HTMLScriptElement>('script[src*="googletagmanager"]')]
}

function dataLayerEntries(): unknown[][] {
  return (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>))
}

function setDoNotTrack(value: string | null | undefined): void {
  Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value })
}

/** deterministic idle stubs built on (fake) setTimeout so the race between input and idle is testable */
function stubIdle(): { ric: ReturnType<typeof vi.fn>; cic: ReturnType<typeof vi.fn> } {
  const ric = vi.fn((cb: IdleRequestCallback) =>
    window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0),
  )
  const cic = vi.fn((id: number) => window.clearTimeout(id))
  Object.defineProperty(window, 'requestIdleCallback', { configurable: true, writable: true, value: ric })
  Object.defineProperty(window, 'cancelIdleCallback', { configurable: true, writable: true, value: cic })
  return { ric, cic }
}

function useFakeTimers(): void {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
}

describe('analytics', () => {
  beforeEach(() => {
    _resetAnalyticsForTests()
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', ID)
    setDoNotTrack(undefined)
  })

  afterEach(() => {
    _resetAnalyticsForTests()
    vi.unstubAllEnvs()
    setDoNotTrack(undefined)
  })

  describe('isAnalyticsEnabled', () => {
    it('is enabled with an id and no do-not-track', () => {
      expect(isAnalyticsEnabled()).toBe(true)
    })

    it('is disabled when the id is empty or whitespace', () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
      expect(isAnalyticsEnabled()).toBe(false)
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '   ')
      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('is disabled when the id is not defined', () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', undefined)
      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('is disabled when do-not-track is on', () => {
      setDoNotTrack('1')
      expect(isAnalyticsEnabled()).toBe(false)
      setDoNotTrack('0')
      expect(isAnalyticsEnabled()).toBe(true)
    })
  })

  describe('when disabled', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
    })

    it('initAnalyticsLazily registers nothing', () => {
      const add = vi.spyOn(window, 'addEventListener')
      const { ric } = stubIdle()
      initAnalyticsLazily()
      expect(add).not.toHaveBeenCalled()
      expect(ric).not.toHaveBeenCalled()
      window.dispatchEvent(new KeyboardEvent('keydown'))
      expect(scripts()).toHaveLength(0)
      expect(window.gtag).toBeUndefined()
    })

    it('loadAnalytics is a no-op', () => {
      loadAnalytics()
      expect(scripts()).toHaveLength(0)
      expect(window.dataLayer).toBeUndefined()
    })

    it('track is a no-op and never queues', () => {
      track('copy', { format: 'json' })
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', ID)
      loadAnalytics()
      expect(dataLayerEntries().filter((e) => e[0] === 'event')).toHaveLength(0)
    })

    it('does nothing when do-not-track is set even with an id', () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', ID)
      setDoNotTrack('1')
      initAnalyticsLazily()
      window.dispatchEvent(new KeyboardEvent('keydown'))
      loadAnalytics()
      track('x')
      expect(scripts()).toHaveLength(0)
      expect(window.gtag).toBeUndefined()
    })
  })

  describe('initAnalyticsLazily', () => {
    beforeEach(() => {
      useFakeTimers()
      stubIdle()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('loads exactly once on the first keydown', () => {
      initAnalyticsLazily()
      expect(scripts()).toHaveLength(0)

      window.dispatchEvent(new KeyboardEvent('keydown'))
      expect(scripts()).toHaveLength(1)
      expect(scripts()[0]?.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${ID}`)
      expect(scripts()[0]?.async).toBe(true)

      window.dispatchEvent(new KeyboardEvent('keydown'))
      window.dispatchEvent(new PointerEvent('pointerdown'))
      vi.runAllTimers()
      expect(scripts()).toHaveLength(1)
      expect(dataLayerEntries().filter((e) => e[0] === 'js')).toHaveLength(1)
    })

    it('loads on pointerdown', () => {
      initAnalyticsLazily()
      window.dispatchEvent(new PointerEvent('pointerdown'))
      expect(scripts()).toHaveLength(1)
    })

    it('pushes js and config entries onto the dataLayer', () => {
      initAnalyticsLazily()
      window.dispatchEvent(new KeyboardEvent('keydown'))

      const entries = dataLayerEntries()
      expect(entries[0]?.[0]).toBe('js')
      expect(entries[0]?.[1]).toBeInstanceOf(Date)
      expect(entries[1]).toEqual(['config', ID, { anonymize_ip: true, send_page_view: true }])
      expect(typeof window.gtag).toBe('function')
    })

    it('does not double-register when called twice', () => {
      const add = vi.spyOn(window, 'addEventListener')
      const { ric } = stubIdle()
      initAnalyticsLazily()
      initAnalyticsLazily()
      expect(add).toHaveBeenCalledTimes(2)
      expect(ric).not.toHaveBeenCalled()

      window.dispatchEvent(new KeyboardEvent('keydown'))
      vi.runAllTimers()
      expect(scripts()).toHaveLength(1)
    })

    it('is a no-op once analytics has already loaded', () => {
      loadAnalytics()
      const add = vi.spyOn(window, 'addEventListener')
      initAnalyticsLazily()
      expect(add).not.toHaveBeenCalled()
    })

    it('does not load while idle when the user never interacts', () => {
      const { ric } = stubIdle()
      initAnalyticsLazily()
      expect(ric).not.toHaveBeenCalled()
      expect(scripts()).toHaveLength(0)

      vi.runAllTimers()
      expect(scripts()).toHaveLength(0)
    })
  })

  describe('loadAnalytics', () => {
    it('is idempotent', () => {
      loadAnalytics()
      const gtag = window.gtag
      loadAnalytics()
      expect(scripts()).toHaveLength(1)
      expect(window.gtag).toBe(gtag)
      expect(dataLayerEntries()).toHaveLength(2)
    })

    it('reuses an existing dataLayer', () => {
      const existing: unknown[] = ['pre']
      window.dataLayer = existing
      loadAnalytics()
      expect(window.dataLayer).toBe(existing)
      expect(existing[0]).toBe('pre')
      expect(existing).toHaveLength(3)
    })

    it('encodes the id in the script url', () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-A&B')
      loadAnalytics()
      expect(scripts()[0]?.src).toContain('?id=G-A%26B')
    })
  })

  describe('track', () => {
    it('queues events before init and flushes them in order after load', () => {
      track('first', { n: 1 })
      track('second')
      track('third', { ok: true, label: 'x' })
      expect(window.dataLayer).toBeUndefined()

      loadAnalytics()

      const events = dataLayerEntries().filter((e) => e[0] === 'event')
      expect(events).toEqual([
        ['event', 'first', { n: 1 }],
        ['event', 'second', undefined],
        ['event', 'third', { ok: true, label: 'x' }],
      ])
      const all = dataLayerEntries()
      expect(all.map((e) => e[0])).toEqual(['js', 'config', 'event', 'event', 'event'])
    })

    it('calls gtag directly after init', () => {
      loadAnalytics()
      const gtag = vi.fn()
      window.gtag = gtag
      track('copy', { format: 'json' })
      expect(gtag).toHaveBeenCalledTimes(1)
      expect(gtag).toHaveBeenCalledWith('event', 'copy', { format: 'json' })
    })

    it('does not replay queued events twice', () => {
      track('once')
      loadAnalytics()
      _resetAnalyticsForTests()
      loadAnalytics()
      expect(dataLayerEntries().filter((e) => e[0] === 'event')).toHaveLength(0)
    })

    it('bounds the queue by dropping the oldest events', () => {
      for (let i = 0; i < 55; i++) track(`e${i}`)
      loadAnalytics()
      const events = dataLayerEntries().filter((e) => e[0] === 'event')
      expect(events).toHaveLength(50)
      expect(events[0]?.[1]).toBe('e5')
      expect(events[49]?.[1]).toBe('e54')
    })
  })

  describe('_resetAnalyticsForTests', () => {
    it('clears globals, scripts, listeners and queued events', () => {
      useFakeTimers()
      stubIdle()
      initAnalyticsLazily()
      track('queued')
      _resetAnalyticsForTests()

      window.dispatchEvent(new KeyboardEvent('keydown'))
      vi.runAllTimers()
      expect(scripts()).toHaveLength(0)
      expect(window.gtag).toBeUndefined()
      expect(window.dataLayer).toBeUndefined()

      loadAnalytics()
      expect(dataLayerEntries().filter((e) => e[0] === 'event')).toHaveLength(0)
      _resetAnalyticsForTests()
      expect(scripts()).toHaveLength(0)
      expect(window.gtag).toBeUndefined()
      vi.useRealTimers()
    })
  })
})

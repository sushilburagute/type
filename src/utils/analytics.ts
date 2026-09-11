/**
 * google analytics 4 via gtag.js, loaded lazily so it never competes with first paint or
 * the first keystroke. the measurement id comes from VITE_GA_MEASUREMENT_ID and is read at
 * call time so an empty id (or a do-not-track browser) disables everything.
 *
 * contract: never pass editor content, file names, or anything user-authored to track().
 * events carry only coarse product signals (which action, which format, how many editors).
 */

const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js'
const MAX_QUEUE = 50

export type TrackParams = Record<string, string | number | boolean>

let scheduled = false
let loaded = false
let queue: Array<[event: string, params: TrackParams | undefined]> = []
let cancelScheduled: (() => void) | undefined

function measurementId(): string | undefined {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID
  return typeof id === 'string' && id.trim() !== '' ? id.trim() : undefined
}

export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (measurementId() === undefined) return false
  return navigator.doNotTrack !== '1'
}

/**
 * arranges a one-time loadAnalytics() on the first pointerdown/keydown. safe to call more
 * than once, and intentionally never loads while the page is idle without user interaction.
 */
export function initAnalyticsLazily(): void {
  if (scheduled || loaded || !isAnalyticsEnabled()) return
  scheduled = true

  const fire = (): void => {
    cancelScheduled?.()
    cancelScheduled = undefined
    loadAnalytics()
  }

  const listenerOptions: AddEventListenerOptions = { once: true, passive: true }
  window.addEventListener('pointerdown', fire, listenerOptions)
  window.addEventListener('keydown', fire, listenerOptions)

  cancelScheduled = () => {
    window.removeEventListener('pointerdown', fire)
    window.removeEventListener('keydown', fire)
  }
}

/** bootstraps the dataLayer + gtag shim, injects the gtag.js script, and drains queued events */
export function loadAnalytics(): void {
  const id = measurementId()
  if (loaded || id === undefined || !isAnalyticsEnabled()) return
  loaded = true

  const dataLayer = (window.dataLayer ||= [])
  const gtag: NonNullable<Window['gtag']> = function () {
    // gtag.js expects the raw arguments object, not an array; a rest param would break it
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', id, { anonymize_ip: true, send_page_view: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `${GTAG_SRC}?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)

  const pending = queue
  queue = []
  for (const [event, params] of pending) gtag('event', event, params)
}

/**
 * records a product event. before gtag is ready the event is queued (bounded) and replayed
 * in order once loadAnalytics() runs. params must never contain editor content.
 */
export function track(event: string, params?: TrackParams): void {
  if (!isAnalyticsEnabled()) return
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params)
    return
  }
  if (queue.length >= MAX_QUEUE) queue.shift()
  queue.push([event, params])
}

/** clears all module state; only for tests */
export function _resetAnalyticsForTests(): void {
  cancelScheduled?.()
  cancelScheduled = undefined
  scheduled = false
  loaded = false
  queue = []
  if (typeof window === 'undefined') return
  delete window.gtag
  delete window.dataLayer
  for (const el of document.querySelectorAll(`script[src^="${GTAG_SRC}"]`)) el.remove()
}

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom is missing a handful of browser apis the app touches; stub them once here.

function stubMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

function stubClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn().mockResolvedValue('') },
  })
}

function stubIdle() {
  window.requestIdleCallback = ((cb: IdleRequestCallback) =>
    window.setTimeout(
      () => cb({ didTimeout: false, timeRemaining: () => 50 }),
      0,
    )) as typeof requestIdleCallback
  window.cancelIdleCallback = ((id: number) => window.clearTimeout(id)) as typeof cancelIdleCallback
}

function stubDialog() {
  // jsdom implements <dialog> but not showModal/close in older versions
  const proto = HTMLDialogElement.prototype
  if (!proto.showModal)
    proto.showModal = function () {
      this.setAttribute('open', '')
    }
  if (!proto.show)
    proto.show = function () {
      this.setAttribute('open', '')
    }
  if (!proto.close)
    proto.close = function () {
      this.removeAttribute('open')
    }
}

function stubFonts() {
  if (!('fonts' in document)) {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: vi.fn().mockResolvedValue([]), check: vi.fn().mockReturnValue(true) },
    })
  }
}

beforeEach(() => {
  stubMatchMedia()
  stubClipboard()
  stubIdle()
  stubDialog()
  stubFonts()
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
  localStorage.clear()
  document.documentElement.dataset.theme = 'light'
  document.documentElement.dataset.accent = 'blue'
  document.documentElement.dataset.font = 'mono'
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

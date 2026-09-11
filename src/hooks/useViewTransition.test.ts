import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { runViewTransition, useViewTransition } from '@/hooks/useViewTransition'

describe('view transitions', () => {
  it('runs directly when the api is unavailable', () => {
    document.startViewTransition = undefined
    const update = vi.fn()
    runViewTransition(update)
    expect(update).toHaveBeenCalledOnce()
  })

  it('runs directly when reduced motion is preferred', () => {
    document.startViewTransition = vi.fn()
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList)
    const update = vi.fn()

    runViewTransition(update)

    expect(update).toHaveBeenCalledOnce()
    expect(document.startViewTransition).not.toHaveBeenCalled()
  })

  it('sets the origin and runs through the browser api', () => {
    const start = vi.fn((callback: () => void) => {
      callback()
      return { ready: Promise.resolve(), finished: Promise.resolve() }
    })
    document.startViewTransition = start as unknown as Document['startViewTransition']
    const update = vi.fn()

    runViewTransition(update, { x: 12, y: 34 })

    expect(document.documentElement.style.getPropertyValue('--vt-x')).toBe('12px')
    expect(document.documentElement.style.getPropertyValue('--vt-y')).toBe('34px')
    expect(start).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledOnce()
  })

  it('does not set a partial transition origin', () => {
    document.documentElement.style.removeProperty('--vt-x')
    document.documentElement.style.removeProperty('--vt-y')
    document.startViewTransition = vi.fn((callback: () => void) => {
      callback()
      return { ready: Promise.resolve(), finished: Promise.resolve() }
    }) as unknown as Document['startViewTransition']

    runViewTransition(() => undefined, { x: 12 })

    expect(document.documentElement.style.getPropertyValue('--vt-x')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--vt-y')).toBe('')
  })

  it('exposes the same behavior through the hook', () => {
    document.startViewTransition = undefined
    const { result } = renderHook(() => useViewTransition())
    const update = vi.fn()
    result.current(update)
    expect(update).toHaveBeenCalledOnce()
  })
})

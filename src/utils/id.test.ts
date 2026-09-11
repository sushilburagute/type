import { afterEach, describe, expect, it, vi } from 'vitest'
import { createId } from '@/utils/id'

describe('createId', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses crypto.randomUUID when available', () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'uuid') })
    expect(createId()).toBe('uuid')
  })

  it('falls back to time and randomness without randomUUID', () => {
    vi.stubGlobal('crypto', undefined)
    vi.spyOn(Date, 'now').mockReturnValue(36)
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(createId()).toMatch(/^10-/)
  })
})

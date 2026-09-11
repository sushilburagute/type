import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyText } from './clipboard'

type ExecCommand = Document['execCommand'] | undefined

function setExecCommand(impl: ExecCommand): void {
  Object.defineProperty(document, 'execCommand', { configurable: true, writable: true, value: impl })
}

function setSecureContext(value: boolean | undefined): void {
  Object.defineProperty(window, 'isSecureContext', { configurable: true, writable: true, value })
}

function writeTextMock() {
  return navigator.clipboard.writeText as ReturnType<typeof vi.fn>
}

describe('copyText', () => {
  beforeEach(() => {
    setExecCommand(undefined)
    setSecureContext(true)
  })

  afterEach(() => {
    setExecCommand(undefined)
    setSecureContext(undefined)
  })

  it('uses the async clipboard api when available', async () => {
    const exec = vi.fn(() => true)
    setExecCommand(exec)

    await expect(copyText('hello')).resolves.toBe(true)
    expect(writeTextMock()).toHaveBeenCalledWith('hello')
    expect(exec).not.toHaveBeenCalled()
  })

  it('falls back to execCommand when writeText rejects', async () => {
    writeTextMock().mockRejectedValueOnce(new Error('denied'))
    const exec = vi.fn(() => true)
    setExecCommand(exec)

    await expect(copyText('hello')).resolves.toBe(true)
    expect(exec).toHaveBeenCalledWith('copy')
  })

  it('falls back to execCommand when the clipboard api is missing', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    const exec = vi.fn(() => true)
    setExecCommand(exec)

    await expect(copyText('hello')).resolves.toBe(true)
    expect(exec).toHaveBeenCalledWith('copy')
  })

  it('skips the clipboard api in an insecure context', async () => {
    setSecureContext(false)
    const exec = vi.fn(() => true)
    setExecCommand(exec)

    await expect(copyText('hello')).resolves.toBe(true)
    expect(writeTextMock()).not.toHaveBeenCalled()
    expect(exec).toHaveBeenCalledWith('copy')
  })

  it('returns false when writeText rejects and execCommand is missing', async () => {
    writeTextMock().mockRejectedValueOnce(new Error('denied'))
    await expect(copyText('hello')).resolves.toBe(false)
  })

  it('returns false when execCommand reports failure', async () => {
    writeTextMock().mockRejectedValueOnce(new Error('denied'))
    setExecCommand(vi.fn(() => false))
    await expect(copyText('hello')).resolves.toBe(false)
  })

  it('returns false when execCommand throws', async () => {
    writeTextMock().mockRejectedValueOnce(new Error('denied'))
    setExecCommand(
      vi.fn(() => {
        throw new Error('not supported')
      }),
    )
    await expect(copyText('hello')).resolves.toBe(false)
  })

  it('selects the text in a hidden readonly textarea and removes it afterwards', async () => {
    writeTextMock().mockRejectedValueOnce(new Error('denied'))
    let seen: HTMLTextAreaElement | null = null
    setExecCommand(
      vi.fn(() => {
        seen = document.querySelector('textarea')
        return true
      }),
    )

    await copyText('payload')

    expect(seen).not.toBeNull()
    const el = seen as unknown as HTMLTextAreaElement
    expect(el.value).toBe('payload')
    expect(el).toHaveAttribute('readonly')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.style.position).toBe('fixed')
    expect(el.style.opacity).toBe('0')
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.body.contains(el)).toBe(false)
  })

  it('removes the textarea even when execCommand throws', async () => {
    writeTextMock().mockRejectedValueOnce(new Error('denied'))
    setExecCommand(
      vi.fn(() => {
        throw new Error('boom')
      }),
    )
    await copyText('x')
    expect(document.querySelector('textarea')).toBeNull()
  })
})

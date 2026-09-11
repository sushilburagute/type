/**
 * copies text to the clipboard, preferring the async clipboard api and falling back to
 * a hidden textarea + execCommand('copy') for insecure contexts and older browsers.
 * resolves false instead of throwing when every strategy fails.
 */
export async function copyText(text: string): Promise<boolean> {
  if (canUseClipboardApi()) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // permission denied or transient failure; try the legacy path below
    }
  }
  return copyViaTextarea(text)
}

function canUseClipboardApi(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') return false
  return window.isSecureContext !== false
}

function copyViaTextarea(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  textarea.tabIndex = -1
  Object.assign(textarea.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
  })
  document.body.appendChild(textarea)
  textarea.select()

  let copied: boolean
  try {
    copied = typeof document.execCommand === 'function' && document.execCommand('copy')
  } catch {
    copied = false
  }
  textarea.remove()
  return copied
}

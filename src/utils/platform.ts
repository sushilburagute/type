export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
    ?.platform
  return /mac|iphone|ipad/i.test(platform ?? navigator.platform ?? '')
}

/** human label for the 'mod' key */
export function modLabel(): string {
  return isMac() ? '⌘' : 'ctrl'
}

/** turns 'mod+shift+n' into a display array like ['ctrl', 'shift', 'n'] */
export function formatKeys(keys: string): string[] {
  return keys.split('+').map((k) => (k === 'mod' ? modLabel() : k === 'alt' && isMac() ? '⌥' : k))
}

/** true when the keyboard event's modifier matches 'mod' on this platform */
export function isModPressed(e: Pick<KeyboardEvent, 'ctrlKey' | 'metaKey'>): boolean {
  return isMac() ? e.metaKey : e.ctrlKey
}

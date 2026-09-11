import { useCallback, useRef, useState } from 'react'
import { getFont } from '@/constants/fonts'
import { type FontFamily } from '@/types/settings'
import { useSettingsStore } from '@/store/settings.store'

const loaded = new Set<FontFamily>(['mono'])

/** loads the font css chunk (and waits for the face) before switching so the editor never shows a fallback flash */
export async function ensureFontLoaded(id: FontFamily): Promise<void> {
  if (loaded.has(id)) return
  const font = getFont(id)
  await font.load?.()
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.load(`1em "${font.family}"`)
    } catch {
      /* font api unavailable — css swap still works */
    }
  }
  loaded.add(id)
}

export function useFontLoader() {
  const setFont = useSettingsStore((s) => s.setFont)
  const [loading, setLoading] = useState<FontFamily | null>(null)
  const request = useRef(0)

  const load = useCallback(
    async (id: FontFamily) => {
      const currentRequest = ++request.current
      setLoading(id)
      try {
        await ensureFontLoaded(id)
        if (request.current === currentRequest) setFont(id)
      } catch {
        // keep the current font when its stylesheet cannot be loaded
      } finally {
        if (request.current === currentRequest) setLoading(null)
      }
    },
    [setFont],
  )

  return { load, loading }
}

/** test hook — forget which fonts are loaded */
export function _resetFontLoaderForTests(): void {
  loaded.clear()
  loaded.add('mono')
}

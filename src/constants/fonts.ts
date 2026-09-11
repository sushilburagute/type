import { type FontFamily } from '@/types/settings'

export interface FontDef {
  id: FontFamily
  label: string
  /** css font-family name as declared by @fontsource */
  family: string
  /** lazy css loader; the default font is imported statically in main.tsx */
  load?: () => Promise<unknown>
}

export const FONTS: readonly FontDef[] = [
  { id: 'mono', label: 'mono', family: 'Geist Mono' },
  {
    id: 'serif',
    label: 'serif',
    family: 'Newsreader',
    load: () =>
      Promise.all([
        import('@fontsource/newsreader/latin-400.css'),
        import('@fontsource/newsreader/latin-600.css'),
      ]),
  },
  {
    id: 'sans',
    label: 'sans',
    family: 'Space Grotesk',
    load: () =>
      Promise.all([
        import('@fontsource/space-grotesk/latin-400.css'),
        import('@fontsource/space-grotesk/latin-700.css'),
      ]),
  },
] as const

export const DEFAULT_FONT: FontFamily = 'mono'

export function getFont(id: FontFamily): FontDef {
  return FONTS.find((f) => f.id === id) ?? FONTS[0]!
}

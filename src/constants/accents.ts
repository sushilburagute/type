import { type Accent } from '@/types/settings'

export const ACCENTS: readonly Accent[] = ['blue', 'red', 'green'] as const

export const DEFAULT_ACCENT: Accent = 'blue'

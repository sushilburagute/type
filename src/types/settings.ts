export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = Exclude<Theme, 'system'>
export type Accent = 'blue' | 'red' | 'green'
export type FontFamily = 'mono' | 'serif' | 'sans'
export type DiffMode = 'split' | 'unified'

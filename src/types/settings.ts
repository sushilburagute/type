export type Theme =
  | 'system'
  | 'light'
  | 'dark'
  | 'dark-modern'
  | 'light-modern'
  | 'monokai'
  | 'solarized-dark'
  | 'quiet-light'
  | 'abyss'
export type ResolvedTheme = Exclude<Theme, 'system'>
export type Accent = 'blue' | 'red' | 'green'
export type FontFamily = 'mono' | 'serif' | 'sans'
export type DiffMode = 'split' | 'unified'

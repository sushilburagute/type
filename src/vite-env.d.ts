/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Document {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void>; ready: Promise<void> }
}

interface Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

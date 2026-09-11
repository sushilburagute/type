/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * injects a <link rel="preload"> for the default editor font (geist mono latin 400)
 * using the hashed filename vite emits, so the first paint never waits on the font.
 */
function fontPreload(): Plugin {
  let preloadHref: string | undefined
  return {
    name: 'type:font-preload',
    apply: 'build',
    generateBundle(_options, bundle) {
      const asset = Object.values(bundle).find(
        (item) => item.type === 'asset' && /geist-mono-latin-400-normal.*\.woff2$/.test(item.fileName),
      )
      if (asset) preloadHref = `/${asset.fileName}`
    },
    transformIndexHtml: {
      order: 'post',
      handler() {
        if (!preloadHref) return []
        return [
          {
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: preloadHref },
            injectTo: 'head-prepend',
          },
        ]
      },
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), react(), fontPreload()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    sourcemap: false,
    reportCompressedSize: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    css: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts', 'src/types/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        'src/utils/**': { lines: 100, functions: 100 },
        'src/store/**': { lines: 90, functions: 90 },
      },
    },
  },
})

# type — implementation plan

## context

`type` is an open-source, zero-backend text scratchpad hosted at **type.sush.dev** (Vercel). The user lands, immediately types or pastes, formats the text, copies it out. Extra editors can be opened with a `+` button, and any two editors can be compared with a git-style diff. Everything is optimised for "textarea is interactive at first paint" and "no external request before the user interacts". Repo `C:\Work\type` is empty (only `.git`, branch `main`, no commits).

## decisions (confirmed with user)

| area          | choice                                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| stack         | Vite 8 + React 19 + TypeScript (strict), pnpm, Tailwind v4, Zustand, jsdiff 9, Vitest + Testing Library, Playwright, ESLint flat + Prettier, Vercel static              |
| fonts         | mono = **Geist Mono** (default, only font on critical path) · serif = **Newsreader** · sans = **Space Grotesk** — self-hosted via `@fontsource/*`, latin woff2          |
| icons         | **Phosphor** (`@phosphor-icons/react`, deep imports, `weight="bold"`)                                                                                                   |
| animations    | CSS-only (`@starting-style`, transitions, keyframes) + View Transitions API for theme toggle; `prefers-reduced-motion` respected; no animation lib                      |
| formatting v1 | case transforms · whitespace/lines · wrapping/encoding · live stats (see §formats)                                                                                      |
| compare       | pick any two open editors (A/B) → split or unified diff, line-level + word-level intra-line highlights; a lazy overlay, not a page                                      |
| editor        | plain `<textarea>` (uncontrolled + debounced sync). Zero JS on keystroke path, native IME/undo/a11y, handles multi-MB paste; CodeMirror (~150 kB) would blow the budget |
| persistence   | editors + settings in localStorage (debounced, flushed on `pagehide`)                                                                                                   |
| theming       | light/dark (+system) × accent blue/red/green, set pre-hydration via inline script → no flash                                                                            |
| UI text       | all lowercase; bold typography; UI chrome uses Geist Mono bold so only one font ships initially; editor/diff follow the chosen font                                     |
| analytics     | gtag, `VITE_GA_MEASUREMENT_ID` placeholder, lazy-loaded after first interaction, no-op when unset or DNT                                                                |
| backlink      | footer "made by sush" → https://sush.dev                                                                                                                                |

## packages

**dependencies:** `react`, `react-dom`, `zustand`, `diff`, `@fontsource/geist-mono`, `@fontsource/newsreader`, `@fontsource/space-grotesk`, `@phosphor-icons/react`

**devDependencies:** `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `tailwindcss`, `@tailwindcss/vite`, `vitest`, `jsdom`, `@vitest/coverage-v8`, `@testing-library/react` (≥16), `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@playwright/test`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `eslint-config-prettier`, `prettier`, `prettier-plugin-tailwindcss`

Gotchas: `tailwindcss()` plugin before `react()` in vite config, no `tailwind.config.js`/postcss; Vitest config lives in `vite.config.ts` (`/// <reference types="vitest/config" />`); `diff` ships its own types; pin `"packageManager": "pnpm@10.x"` (pnpm is not on PATH — bootstrap with `corepack enable pnpm`; Node 24 present).

## folder structure

```
type/
├── .github/            ISSUE_TEMPLATE/{bug_report,feature_request}.yml, config.yml, PULL_REQUEST_TEMPLATE.md, workflows/ci.yml
├── docs/               architecture.md, formats.md, shortcuts.md, theming.md
├── plan/               2026-09-implementation-plan.md (this file)
├── e2e/                first-interaction / format-copy / multi-editor-compare / persistence / shortcuts .spec.ts, fixtures/
├── public/             favicon.svg, og.png, robots.txt, site.webmanifest
├── scripts/            check-bundle-size.mjs
├── src/
│   ├── main.tsx, App.tsx, vite-env.d.ts
│   ├── components/     one component per file, folder-per-component, colocated *.test.tsx
│   │   ├── app-shell/AppShell.tsx
│   │   ├── top-bar/TopBar.tsx
│   │   ├── header-menu/HeaderMenu.tsx
│   │   ├── workspace/Workspace.tsx
│   │   ├── editor/Editor.tsx · editor/EditorTextarea.tsx
│   │   ├── editor-toolbar/EditorToolbar.tsx
│   │   ├── editor-footer/EditorFooter.tsx
│   │   ├── add-editor-button/AddEditorButton.tsx
│   │   ├── format-menu/FormatMenu.tsx
│   │   ├── command-palette/CommandPalette.tsx            (lazy)
│   │   ├── compare/CompareView.tsx (lazy) · ComparePicker.tsx · DiffView.tsx · DiffLine.tsx
│   │   ├── theme-toggle/ThemeToggle.tsx · accent-picker/AccentPicker.tsx · font-picker/FontPicker.tsx
│   │   ├── toast/Toast.tsx · toast/ToastHost.tsx
│   │   ├── footer/Footer.tsx
│   │   ├── shortcuts-sheet/KeyboardShortcutsSheet.tsx   (lazy)
│   │   └── ui/ Button.tsx · IconButton.tsx · Dialog.tsx (native <dialog>) · Kbd.tsx · icons.ts (phosphor barrel)
│   ├── constants/      accents.ts · fonts.ts · formats.ts (registry) · shortcuts.ts · storage-keys.ts · limits.ts
│   ├── hooks/          useKeyboardShortcuts · useTheme · useFontLoader · useClipboard · useToast · useEditorContent · useTextStats · useViewTransition · useMediaQuery
│   ├── store/          editors.store.ts · settings.store.ts · ui.store.ts · migrations.ts (+ tests)
│   ├── types/          editor.ts · settings.ts · format.ts · diff.ts · shortcut.ts
│   ├── utils/
│   │   ├── text/       case.ts · lines.ts · whitespace.ts · wrap.ts · encode.ts · stats.ts · words.ts (+ tests)
│   │   ├── diff/       computeDiff.ts · pairChanges.ts · intraLine.ts · toUnified.ts · toSplit.ts · __fixtures__/
│   │   └── clipboard.ts · storage.ts · analytics.ts · id.ts · platform.ts · cn.ts
│   ├── styles/         index.css (@import tailwind + @theme) · theme.css · fonts.css · transitions.css
│   └── test/           setup.ts (jest-dom + matchMedia/ResizeObserver/clipboard/startViewTransition/requestIdleCallback mocks) · render.tsx
├── index.html, vite.config.ts, playwright.config.ts, eslint.config.js, .prettierrc, tsconfig{,.app,.node}.json
├── vercel.json, .env.example (VITE_GA_MEASUREMENT_ID=), .gitignore, .nvmrc (24), package.json
└── README.md, CONTRIBUTING.md, LICENSE (MIT), CHANGELOG.md, SECURITY.md
```

Alias `@/` → `src/` in both `tsconfig.app.json` and `vite.config.ts`.

## components

| component                            | responsibility / key interactions                                                                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `App`                                | mounts `AppShell`, runs `useTheme`, `useKeyboardShortcuts`, `initAnalyticsLazily()` once                                                                                                             |
| `AppShell`                           | grid: top bar / workspace / footer; `<Suspense>` for lazy overlays; hosts `ToastHost`                                                                                                                |
| `TopBar`                             | bold lowercase wordmark "type", compare button (disabled < 2 editors), and compact `HeaderMenu` trigger                                                                                              |
| `HeaderMenu`                         | native popover for lower-frequency font, accent, theme, and keyboard-shortcut controls                                                                                                               |
| `Workspace`                          | renders `Editor` per id from `order` (shallow-subscribed) + `AddEditorButton`; CSS grid `repeat(auto-fit, minmax(min(100%, 28rem), 1fr))` → side-by-side on wide, stacked on narrow                  |
| `Editor`                             | card = toolbar + textarea + footer; focus → `setActive(id)`; first editor gets `autoFocus` (skipped on `pointer: coarse`)                                                                            |
| `EditorTextarea`                     | memoized plain `<textarea>`; `spellcheck=false`, `autocapitalize=off`; `onInput` → 50 ms debounced `setContent`; Tab inserts two spaces; resyncs DOM from store via `useLayoutEffect` keyed on `rev` |
| `EditorToolbar`                      | inline-editable title (dbl-click), `FormatMenu` trigger, copy (→ toast "copied"), clear, close (native `confirm` when non-empty)                                                                     |
| `EditorFooter`                       | `n chars · n words · n lines · n sentences · ~n min read` via `useTextStats` (`useDeferredValue`)                                                                                                    |
| `FormatMenu`                         | eager popover, formats grouped case / lines / wrap / encode, shows shortcut hints; calls `applyFormat(editorId, formatId)`                                                                           |
| `CommandPalette` (lazy)              | `mod+k`; filters format registry + app commands; arrow/enter/esc; `role=dialog` + `listbox`; acts on active editor                                                                                   |
| `AddEditorButton`                    | "+" tile; `addEditor()` then focuses new textarea via `ui.store.focusRequestId`; disabled at `MAX_EDITORS` (8)                                                                                       |
| `CompareView` (lazy, carries `diff`) | native `<dialog>` overlay; `ComparePicker` + `DiffView`; split/unified toggle (persisted), swap A/B, esc closes; diff memoised on deferred contents                                                  |
| `ComparePicker`                      | two `<select>`s of editor titles; defaults A = first, B = active/second; swap                                                                                                                        |
| `DiffView`                           | renders `DiffRow[]` unified (one column) or split (two aligned columns); header `+n −n`                                                                                                              |
| `DiffLine`                           | memo'd line: gutter numbers, +/− marker, `<mark>` intra-line segments                                                                                                                                |
| `ThemeToggle`                        | cycles system → light → dark with circular-reveal view transition from click point                                                                                                                   |
| `AccentPicker`                       | three dots → `data-accent`                                                                                                                                                                           |
| `FontPicker`                         | segmented mono/serif/sans; awaits `useFontLoader.load()` (`import('@fontsource/…/400.css')` + `document.fonts.load`) before switching → no FOIT                                                      |
| `Toast`/`ToastHost`                  | bottom-center, 1.8 s, `aria-live=polite`, max 3                                                                                                                                                      |
| `Footer`                             | responsive three-column layout: portfolio backlink, centered local-only/storage status, and source link                                                                                              |
| `KeyboardShortcutsSheet` (lazy)      | `<dialog>` listing `SHORTCUTS` with `Kbd`                                                                                                                                                            |

## state (zustand)

```ts
// editors.store.ts — persist key 'type:editors', version 1
{ editors: Record<id, {id,title,content,rev,createdAt,updatedAt}>, order: string[], activeEditorId,
  addEditor, removeEditor, setContent, setTitle, setActive, applyFormat }
// settings.store.ts — persist key 'type:settings', version 1
{ theme:'system'|'light'|'dark', accent:'blue'|'red'|'green', font:'mono'|'serif'|'sans', diffMode:'split'|'unified', setters }
// ui.store.ts — not persisted
{ paletteOpen, compareOpen, shortcutsOpen, compareA, compareB, focusRequestId, toasts[] }
```

- normalised map + `order` array → typing in editor 1 only changes `editors[1]`; other editors' selectors return same reference, no re-render. `EditorFooter` selects the content string only.
- `rev` counter bumped only by non-typing mutations (format, clear, rehydrate); `EditorTextarea` writes `el.value` when `rev` changes, never while typing. Input debounce flushed before format/copy/compare.
- persist: `partialize`, `createJSONStorage(() => debouncedLocalStorage)` — `utils/storage.ts` coalesces writes (300 ms trailing), flushes on `visibilitychange:hidden`/`pagehide`, catches `QuotaExceededError` → one-time toast, keeps working in memory. `getItem` is sync so persisted text is in `defaultValue` at mount.
- one `untitled` editor created in `onRehydrateStorage` when `order` is empty. `migrations.ts` has v0→v1 no-op scaffold.
- `applyFormat` is a store action so menu/palette/shortcuts share one path and it's testable without React; `FormatError` (invalid json/base64) is caught → toast.

## formats (`constants/formats.ts` registry → `{ id, label, group, fn, keywords?, shortcut? }`)

- **case** (`utils/text/case.ts`, shared tokenizer `words.ts`): lowercase, uppercase, title case, sentence case, camelCase, snake_case, kebab-case
- **lines/whitespace** (`lines.ts`, `whitespace.ts`): trim, collapse spaces, remove empty lines, remove line breaks, sort a→z, sort z→a, dedupe lines, reverse lines
- **wrap** (`wrap.ts`): wrap in quotes, wrap in backticks, add line numbers, indent, dedent
- **encode** (`encode.ts`): url encode/decode, base64 encode/decode, json pretty/minify
- **stats** (`stats.ts`, not a format): chars, words, lines, sentences (`/[.!?]+(\s|$)/g`), reading time `ceil(words/200)`

All pure functions, each with table-driven tests (empty, unicode/emoji/CJK, CRLF, idempotence, encode round-trips, invalid input throws `FormatError`). Registry test asserts unique ids, lowercase labels, unique shortcuts.

## theming

- `styles/index.css`: `@import "tailwindcss"`; `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`; `@theme` maps semantic tokens (`--color-bg/fg/muted/line/surface/accent/accent-fg/diff-add/diff-remove`, `--font-mono/serif/sans`) to raw CSS vars.
- `theme.css`: `[data-theme=light|dark]` set bg/fg/muted/line/surface/diff colors + `color-scheme`; `[data-accent=blue|red|green]` set `--accent`/`--accent-fg` (lighter variant under dark). Accent drives focus rings, wordmark, active states, diff `<mark>`, `::selection` via `color-mix`.
- `fonts.css`: `--font-editor` = mono by default, `[data-font=serif|sans]` override; `textarea, .font-editor { font-family: var(--font-editor) }`.
- `index.html` inline pre-hydration script (~300 B, try/catch): read `localStorage['type:settings']`, resolve `system` via `matchMedia`, set `data-theme` (always `light|dark`), `data-accent`, `data-font`; if saved font ≠ mono inject a preload link for it. `useTheme` re-resolves on system change.
- fonts: `main.tsx` statically imports geist-mono 400/700 css; a small `transformIndexHtml` Vite plugin injects `<link rel=preload as=font>` for the hashed latin-400 woff2. Serif/sans css chunks loaded on demand.
- `transitions.css`: `::view-transition-*` 240 ms with circular `clip-path` reveal from `--vt-x/--vt-y`; everything animated is disabled under `prefers-reduced-motion`. `useViewTransition` guards `document.startViewTransition` + reduced motion and wraps in `flushSync`.

## performance

targets: initial JS < 95 kB gz, CSS < 12 kB gz, self-hosted woff2 fonts; Lighthouse mobile perf ≥ 98, LCP < 1.2 s, TBT 0, CLS 0.

1. no external requests before interaction: fonts self-hosted, no CDN, GA gated (asserted by e2e).
2. autofocus first textarea on mount (`focus({preventScroll:true})`, skipped on coarse pointers).
3. uncontrolled textarea + 50 ms debounced store commit + 300 ms debounced localStorage; stats via `useDeferredValue`.
4. `React.lazy` for `CommandPalette`, `CompareView` (only place `diff` lives), `KeyboardShortcutsSheet`; prefetch their chunks on `requestIdleCallback` after first input (skip when `saveData`).
5. icons through `components/ui/icons.ts` barrel using deep `@phosphor-icons/react/dist/ssr/*` paths (also keeps Vitest fast).
6. GA: `utils/analytics.ts` — one-time `pointerdown`/`keydown` listener injects gtag after interaction; `track()` queues into `dataLayer` pre-init; never sends editor content; respects DNT.
7. `vercel.json`: SPA rewrite; `/assets/*` + woff2 `immutable, max-age=31536000`; `index.html` `no-cache`; nosniff/referrer-policy headers. Vite `build.target: 'es2022'`, `modulePreload.polyfill: false`.
8. `scripts/check-bundle-size.mjs` fails CI when entry chunk gz > 95 kB.
9. `React.memo` on `EditorTextarea`/`DiffLine`, `useShallow` for id arrays, no context that changes on typing.

## diff (`utils/diff/`)

```ts
type Segment = { text: string; kind: 'equal' | 'add' | 'remove' }
type LineRef = { n: number; text: string }
type DiffRow =
  | { type: 'equal'; left; right }
  | { type: 'add'; right }
  | { type: 'remove'; left }
  | { type: 'modify'; left; right; leftSegments: Segment[]; rightSegments: Segment[] }
interface DiffResult {
  rows: DiffRow[]
  added: number
  removed: number
  identical: boolean
}
```

1. normalise CRLF → LF, `diffLines(a, b)`.
2. `pairChanges`: walk changes tracking line numbers; a `removed` block immediately followed by `added` is zipped line-by-line into `modify` rows, remainder as plain add/remove.
3. `intraLine`: `diffWordsWithSpace` per modify row → segments; if > 60 % changed, drop segments (avoid noise).
4. `toUnified(rows)` / `toSplit(rows)` derive display lines from the same rows; `DiffView` picks by `diffMode`.
5. no virtualisation in v1; `DIFF_LINE_WARN_THRESHOLD = 5000` shows a warning, intra-line disabled above 20k lines.

Fixtures: identical, add-only, remove-only, single modified line, moved block, CRLF vs LF, empty vs non-empty, trailing newline, unicode. Invariant tests: concatenated right-side texts === `b`.

## keyboard shortcuts (`constants/shortcuts.ts`, `mod` = ctrl/cmd)

`mod+k` palette · `mod+shift+n` new editor · `mod+shift+w` close active · `mod+shift+c` copy active · `mod+shift+d` compare · `mod+shift+u` uppercase · `mod+shift+l` lowercase · `mod+shift+t` title case · `mod+shift+j` json pretty · `mod+/` toggle theme · `alt+1..8` focus editor n · `?` (outside textarea) shortcuts sheet · `esc` close overlay. Never override plain `mod+c/v/z/a` or `mod+shift+v/x/z`. Single `keydown` listener on `window`.

## testing

**unit (Vitest, jsdom, `css:false`, setup mocks):** every `utils/**` fn (100 % lines/functions), `store/**` (90 %), global 80 %; storage debounce with fake timers; analytics no-op/inject-once/queue; formats registry; component behaviours: typing reaches store after debounce, copy → clipboard mock + toast, format menu applies, add/close editors, theme toggle sets `data-theme`, font picker awaits loader, compare renders rows + toggles mode, palette filters/executes, shortcuts sheet lists all, 1 MB paste → single store write, render-count test that typing in one editor doesn't re-render another.

**e2e (Playwright, chromium, `webServer: pnpm exec vite preview --port 4173` on the production build):**

1. `first-interaction` — goto `/`, `keyboard.type` with no click → text in textarea; zero non-localhost requests before typing.
2. `format-copy` — paste multi-line → uppercase → copy → clipboard matches + toast.
3. `multi-editor-compare` — `+` → two texts → compare → add/remove rows → toggle unified/split → esc.
4. `persistence` — type, set dark/red/serif, reload → text present, `html[data-theme=dark][data-accent=red][data-font=serif]` at `domcontentloaded`, textarea font-family includes Newsreader.
5. `shortcuts` — `ControlOrMeta+Shift+N`, `ControlOrMeta+K` → "kebab" → enter, `ControlOrMeta+Shift+C`, `?`.

**CI (`.github/workflows/ci.yml`):** on push/PR to `main`; job `check` (node 24, pnpm via `packageManager`, `--frozen-lockfile`, lint, `tsc -b --noEmit`, `vitest --coverage`, build, bundle-size, upload dist) → job `e2e` (download dist, cached `~/.cache/ms-playwright`, `playwright install --with-deps chromium`, run, upload report on failure). Concurrency per ref.

## docs & oss

- `README.md`: lowercase "type" wordmark, "type, format, compare, copy. nothing else.", live link, screenshot, features, shortcuts table, stack, quick start (`corepack enable && pnpm i && pnpm dev`), scripts, deploy + `VITE_GA_MEASUREMENT_ID`, privacy note (no content sent to GA), contributing, MIT, "made by [sush](https://sush.dev)".
- `docs/architecture.md` (data flow textarea → store → storage, store shapes, why textarea, chunk map, perf budget), `docs/formats.md` (add fn + test → register → appears everywhere), `docs/shortcuts.md`, `docs/theming.md`.
- `CONTRIBUTING.md` (setup, conventional commits, PR checklist: tests, lowercase UI text, no new deps without discussion, bundle budget), `LICENSE` MIT © 2026 Sush, `SECURITY.md`, issue templates, PR template.
- `package.json`: `name: "type"`, `private: true`, `license: MIT`, `homepage: https://type.sush.dev`.

## implementation phases (each is a commit; subagents used for parallelisable chunks like utils+tests, docs, e2e)

Local implementation for phases 0–7 and the code/CI portion of phase 8 is complete. On 2026-09-11, lint, typecheck, 535 tests with coverage, production build, the 86.0 KB gzip entry bundle, and all 18 desktop/mobile Playwright cases passed. External release work remains: connect the Vercel project, point `type.sush.dev`, set the optional analytics id, and record production Lighthouse results.

| #   | milestone                                                                                                                                                                                                                                                  | done when                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0   | scaffold: copy plan to `plan/`, `corepack enable pnpm`, `pnpm create vite` react-ts, strip template, tailwind plugin, alias, eslint/prettier/tsconfig strict, vitest setup mocks, `.gitignore`/`.nvmrc`/`.env.example`/`vercel.json`/LICENSE, first commit | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass                       |
| 1   | theming + fonts: styles, pre-hydration script, `settings.store`, `useTheme`/`useViewTransition`/`useFontLoader`, font-preload plugin, ThemeToggle/AccentPicker/FontPicker, TopBar, Footer                                                                  | theme/accent/font persist with no flash; only geist-mono woff2 on first load; tests |
| 2   | editor core: `editors.store` + debounced storage + migrations, Editor/EditorTextarea/EditorToolbar/EditorFooter, `stats.ts`, `useClipboard`, Toast                                                                                                         | land → type instantly; refresh keeps text; stats live; copy + toast; tests          |
| 3   | formats: all `utils/text/*` (100 % tested), `FormatError`, registry + test, `applyFormat` with `rev`, FormatMenu, `docs/formats.md`                                                                                                                        | every format applies from menu; invalid input toasts                                |
| 4   | multi-editor: Workspace grid, AddEditorButton, close, titles, active tracking, `MAX_EDITORS`, focus request                                                                                                                                                | add/close/side-by-side; render-count test passes                                    |
| 5   | compare: `utils/diff/*` + fixtures, CompareView/ComparePicker/DiffView/DiffLine, persisted diffMode                                                                                                                                                        | both modes correct; `diff` only in lazy chunk                                       |
| 6   | shortcuts + palette: `constants/shortcuts.ts`, `useKeyboardShortcuts`, CommandPalette, KeyboardShortcutsSheet                                                                                                                                              | all shortcuts work with win/mac labels; sheet lists from same constant              |
| 7   | analytics + polish: `analytics.ts`, `track()` on format/compare/copy, footer backlink, favicon/og/manifest, animations, reduced-motion, a11y pass                                                                                                          | GA no-op without env; loads only after interaction                                  |
| 8   | e2e + CI + deploy: playwright config + 5 specs, ci workflow, bundle-size script, README/CONTRIBUTING/docs/templates, Vercel project + env var, Lighthouse numbers in README                                                                                | CI green; type.sush.dev live; Lighthouse ≥ 98 perf / 100 a11y                       |

## risks / gotchas

- pnpm not on PATH → `corepack enable pnpm`; pin `packageManager`.
- Tailwind v4: plugin order, `@custom-variant dark` for `data-theme`, `@reference` if using `@apply` in component css, `tailwindStylesheet` for the prettier plugin.
- jsdom lacks `matchMedia`, `ResizeObserver`, `startViewTransition`, `navigator.clipboard`, `requestIdleCallback` → stub in `src/test/setup.ts`; clear `localStorage` in `beforeEach`; RTL 16 needs explicit `@testing-library/dom`; wrap timer advances in `act`.
- clipboard needs secure context + gesture → `execCommand('copy')` fallback; in Playwright grant `clipboard-read/write`.
- `crypto.randomUUID` needs secure context → fallback in `utils/id.ts`.
- uncontrolled sync: every store-driven content change must bump `rev` (covered by component test); flush input debounce before format/copy/compare.
- View Transitions unsupported in Firefox → feature-detect; `flushSync` required inside callback.
- font preload must use the emitted hashed filename → Vite plugin, never hardcode.
- localStorage ~5 MB quota → catch, toast once, continue in memory.
- Playwright on Windows: shell-agnostic `webServer.command`, `reuseExistingServer: !CI`, `ControlOrMeta` modifier.
- `alt+N` may clash with OS/browser menus → best-effort, documented.
- inline pre-hydration script needs a hash if a strict CSP is ever added (documented).

## verification

1. `pnpm lint && pnpm typecheck && pnpm test -- --coverage && pnpm build && node scripts/check-bundle-size.mjs` — all green, thresholds met, entry chunk < 95 kB gz.
2. `pnpm e2e` against `vite preview` — 5 specs pass on chromium.
3. manual/devtools: load `/` on Slow 4G throttle → textarea focused and typeable before any font/GA request; network tab shows only same-origin requests until first keypress; toggling theme has no flash on reload; `dist/` shows `diff` only inside the compare chunk.
4. Lighthouse (mobile) on the Vercel preview: perf ≥ 98, a11y 100, CLS 0.
5. deploy to Vercel, point `type.sush.dev`, set `VITE_GA_MEASUREMENT_ID`, confirm gtag loads only after interaction.

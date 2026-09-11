# architecture

`type` is a static single-page app: vite, react 19, zustand, a plain textarea and localStorage. this document explains how data moves through it, why it is shaped the way it is, and the conventions to keep when adding to it.

## data flow

```
keystroke
  └─ <textarea> (uncontrolled, dom owns the text)
       └─ onInput → useEditorContent: 50 ms trailing debounce
            └─ editors.store setContent(id, content)
                 └─ zustand persist → createDebouncedStorage: 300 ms trailing debounce
                      └─ localStorage['type:editors']
```

- the textarea is uncontrolled. react never re-renders it on a keystroke; the dom holds the value.
- `useEditorContent` (`src/hooks/useEditorContent.ts`) collects input and commits to the store after `INPUT_DEBOUNCE_MS` (50 ms). it registers a flusher per editor so anything that reads the store (format, copy, compare) can call `flushInput(id)` first and never miss the last few keystrokes.
- the editors store is persisted through `createDebouncedStorage` (`src/utils/storage.ts`), which defers JSON serialization, coalesces writes to the same key on a 300 ms trailing debounce (`STORAGE_DEBOUNCE_MS`), flushes pending input and storage on `visibilitychange: hidden` and `pagehide`, and reports `QuotaExceededError` once so the ui can show a warning while continuing in memory. reads are synchronous, so persisted text is available at mount.
- the settings store writes to localStorage synchronously. it is tiny, and the pre-hydration script in `index.html` reads it before first paint, so the persisted shape `{ state: { theme, accent, font, diffMode } }` must stay stable.

## the `rev` counter

because the textarea is uncontrolled, the store cannot push content into it by re-rendering. each editor document carries a `rev` number:

- `setContent` is the typing path. it updates `content` and does not touch `rev`.
- `replaceContent` is the programmatic path (format, clear, migration). it updates `content` and bumps `rev`.
- `EditorTextarea` watches `rev` in a `useLayoutEffect` and writes `el.value = content` when it changes, never while typing.

any new store action that changes content from outside the textarea must go through `replaceContent`, otherwise the dom and the store drift apart. there is a component test that asserts this.

## store shapes

three zustand stores in `src/store/`.

```ts
// editors.store.ts — persisted as 'type:editors', version 1
{
  editors: Record<id, { id, title, content, rev, createdAt, updatedAt }>,
  order: string[],
  activeEditorId: string | null,
  addEditor, removeEditor, setContent, replaceContent, setTitle, setActive, applyFormat, clearContent
}

// settings.store.ts — persisted as 'type:settings', version 1, written synchronously
{
  theme: 'system' | 'light' | 'dark',
  accent: 'blue' | 'red' | 'green',
  font: 'mono' | 'serif' | 'sans',
  diffMode: 'split' | 'unified',
  setTheme, setAccent, setFont, setDiffMode
}

// ui.store.ts — not persisted
{
  paletteOpen, compareOpen, shortcutsOpen,
  compareA, compareB,
  focusRequestId,
  toasts: { id, message }[],
  storageWarning: string | null,
  ...setters
}
```

editors are a normalised map plus an `order` array. typing in one editor changes only `editors[id]`; selectors for other editors return the same reference and those components do not re-render. `EditorFooter` selects only the content string. `MAX_EDITORS` (8) is enforced in `addEditor`. when the last editor is removed, or storage is empty on load, one `untitled` editor is created.

`applyFormat` is a store action so the menu, the palette and the shortcut handler share one path and it can be tested without react. a `FormatError` is caught and shown as a toast; other errors are bugs and propagate.

`migrations.ts` holds `migrateEditors` and `migrateSettings` with a version switch. bump the version and add a case when the persisted shape changes.

## why a plain textarea

a code editor component (codemirror, monaco) would cost 150 kb or more of javascript before the first keystroke and would put javascript on the typing path. a native textarea:

- is interactive the moment html is parsed, before any script runs
- gives native ime, undo, spellcheck control, selection and screen reader behaviour for free
- handles multi-megabyte pastes without a virtual document model
- keeps the entry chunk small enough to meet the budget

the trade-off is no syntax highlighting or line numbers inside the editor. that is acceptable for a scratchpad.

## code splitting

| chunk           | contains                                                                                                          | loaded                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| entry           | react, react-dom, zustand, app shell, editors, toolbar, footer, format menu, stores, text formats, geist mono css | at page load                              |
| compare         | `CompareView`, `ComparePicker`, `DiffView`, `DiffLine`, `utils/diff/*`, jsdiff                                    | on first compare, prefetched after typing |
| command palette | `CommandPalette`                                                                                                  | on first `mod+k`, prefetched after typing |
| shortcuts sheet | `KeyboardShortcutsSheet`                                                                                          | on first `?`                              |
| serif font      | newsreader latin 400 and 600 css and woff2                                                                        | when serif is picked                      |
| sans font       | space grotesk latin 400 and 700 css and woff2                                                                     | when sans is picked                       |

the three overlays are `React.lazy` in `src/components/app-shell/AppShell.tsx` behind one `<Suspense>`. `App.tsx` prefetches the compare and palette chunks on `requestIdleCallback` after the first keydown, skipped when `navigator.connection.saveData` is set. `scripts/check-bundle-size.mjs` fails if the entry chunk exceeds the budget or contains jsdiff. see [performance.md](performance.md).

## theming pipeline

```
localStorage['type:settings']
  └─ inline script in index.html (runs before first paint)
       └─ <html data-theme="light|dark" data-accent="…" data-font="…">
            └─ src/styles/theme.css: [data-theme] and [data-accent] set raw vars (--bg, --fg, --accent, …)
                 └─ src/styles/index.css: @theme inline maps them to tailwind tokens (--color-bg, --color-accent, …)
                      └─ utilities like bg-bg, text-accent, border-line
```

`useTheme` mirrors the settings store onto the same `data-*` attributes after hydration and re-resolves `system` when the os preference changes. `data-theme` is always `light` or `dark`; `system` is resolved before it reaches the dom. the theme toggle wraps the change in `document.startViewTransition` for a circular reveal. see [theming.md](theming.md).

## diff pipeline

`src/utils/diff/` is pure and framework-free. it is imported only by the compare chunk.

```
computeDiff(a, b)
  ├─ canonicalText: crlf and cr → lf
  ├─ diffLines(a, b, { ignoreNewlineAtEof: true })      jsdiff
  ├─ pairChanges: one DiffRow per line; a removed block followed by an added block is zipped
  │               line by line into `modify` rows, the remainder becomes plain add / remove
  ├─ intraLine: diffWordsWithSpace per modify row → segments; dropped when more than 60% of
  │             the characters changed, or when the diff has more than DIFF_INTRALINE_MAX_ROWS (20,000) rows
  └─ DiffResult { rows, added, removed, identical }
        ├─ toUnified(rows) → DisplayLine[]      one column
        └─ toSplit(rows)   → SplitRow[]         two aligned columns
```

`DiffView` picks `toUnified` or `toSplit` by `settings.diffMode`. above `DIFF_LINE_WARN_THRESHOLD` (5,000) rows the view shows a warning; there is no virtualisation in v1. the diff is memoised on deferred editor contents. fixtures in `src/utils/diff/__fixtures__/` cover identical, add-only, remove-only, modified, moved block, crlf vs lf, empty vs non-empty, trailing newline and unicode. an invariant test checks that the concatenated right-side rows equal `b`.

## keyboard shortcuts

one `keydown` listener on `window`, installed by `useKeyboardShortcuts`. `handleShortcut` is exported and tested directly. `src/constants/shortcuts.ts` is the single source of truth for keys and labels; the shortcuts sheet and the format menu hints render from it. `isModPressed` in `src/utils/platform.ts` maps `mod` to `metaKey` on mac and `ctrlKey` elsewhere. see [shortcuts.md](shortcuts.md).

## analytics

`src/utils/analytics.ts` is a no-op unless `VITE_GA_MEASUREMENT_ID` is set and `navigator.doNotTrack` is not `'1'`. `initAnalyticsLazily` waits for the first `pointerdown` or `keydown`, then injects gtag.js with `anonymize_ip`. `track(event, params)` queues up to 50 events before that and replays them in order. params must never contain editor content; the current events are `format`, `copy`, `compare_open`, `add_editor` and `font`.

## testing

**unit** (vitest, jsdom, `css: false`, setup in `src/test/setup.ts` with mocks for `matchMedia`, `ResizeObserver`, `navigator.clipboard`, `startViewTransition` and `requestIdleCallback`):

- every function under `src/utils/**` with table-driven cases, 100% lines and functions
- stores at 90%, everything else at 80% lines, functions and statements, 75% branches
- component behaviour: typing reaches the store after the debounce, copy hits the clipboard mock and toasts, format menu applies, add and close editors, theme toggle sets `data-theme`, font picker awaits the loader, compare renders rows and toggles mode, palette filters and executes, shortcuts sheet lists every shortcut, a 1 mb paste is a single store write, typing in one editor does not re-render another

**end-to-end** (playwright, chromium desktop plus a pixel 7 profile for two specs, against `vite preview` on the production build): first interaction with zero non-localhost requests, format and copy, multi-editor compare, persistence across reload with theme, accent and font applied at `domcontentloaded`, shortcuts.

## adding a component

- one folder per component under `src/components/`, named in kebab-case, with `PascalCase.tsx` inside and a colocated `PascalCase.test.tsx`
- shared primitives live in `src/components/ui/` (`Button`, `IconButton`, `Dialog` on native `<dialog>`, `Kbd`)
- import icons from `src/components/ui/icons.ts`, which re-exports phosphor icons by deep path (`@phosphor-icons/react/dist/csr/<Name>`). this keeps only the used glyphs in the bundle and keeps vitest fast. add new icons to that file rather than importing from the package index
- subscribe to stores with narrow selectors; use `useShallow` for arrays of ids
- anything that opens rarely (dialogs, sheets) should be lazy and rendered under the `<Suspense>` in `AppShell`
- all visible text is lowercase

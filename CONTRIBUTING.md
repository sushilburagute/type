# contributing

thanks for helping with `type`. this file covers setup, conventions and what a pull request needs.

## setup

node 20 or newer (`.nvmrc` pins 24) and pnpm 10. the `packageManager` field in `package.json` pins the exact pnpm version.

```sh
git clone https://github.com/sushilburagute/type.git
cd type
corepack enable pnpm   # or: npm i -g pnpm
pnpm install
pnpm dev
```

## branches

branch from `main` and prefix the name with the kind of change:

- `feat/` for new behaviour
- `fix/` for bug fixes
- `docs/` for documentation only

## commits

use [conventional commits](https://www.conventionalcommits.org/): `feat: add reverse words format`, `fix: flush input before compare`, `docs: explain rev counter`. keep the subject lowercase and under 72 characters.

## before opening a pull request

run the full check locally. ci runs the same thing.

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm size
```

### end-to-end tests

playwright runs against the production build served by `vite preview`, never the dev server.

```sh
pnpm exec playwright install chromium   # once
pnpm build && pnpm e2e
```

`pnpm e2e:ui` opens the playwright ui for debugging a single spec.

### coverage

`pnpm test:coverage` enforces thresholds: 100% lines and functions under `src/utils/**`, 90% under `src/store/**`, 80% globally. a new util without tests fails the build.

## adding a format

formats are pure `(input: string) => string` functions registered in `src/constants/formats.ts`. the menu, the palette and the shortcut map are derived from that registry, so registering is the only wiring step. the full walkthrough, naming rules and error contract are in [docs/formats.md](docs/formats.md).

## adding a shortcut

1. add an entry to `SHORTCUTS` in `src/constants/shortcuts.ts` with an `id`, a lowercase `label`, the `keys` string (`mod` means ctrl or cmd) and `inEditor` (whether it fires while a textarea has focus).
2. handle the key in `handleShortcut` in `src/hooks/useKeyboardShortcuts.ts`. flush the input debounce with `flushInput()` before reading editor content.
3. add a test for the handler.

the shortcuts sheet and the format menu hints read from the same constant, so the new shortcut appears there automatically. never bind plain `mod+c`, `mod+v`, `mod+z`, `mod+a` or `mod+shift+v/x/z`; those belong to the browser. see [docs/shortcuts.md](docs/shortcuts.md).

## adding a component

one folder per component under `src/components/`, `PascalCase.tsx` inside it, test colocated as `PascalCase.test.tsx`. import icons from `src/components/ui/icons.ts`, which re-exports phosphor icons by deep path; add new ones there. see [docs/architecture.md](docs/architecture.md).

## pull request checklist

- [ ] tests added or updated, and `pnpm test` passes
- [ ] all ui text is lowercase
- [ ] no new dependency without an issue discussing it first
- [ ] `pnpm build && pnpm size` passes; nothing new lands in the entry chunk that could be lazy
- [ ] checked in light and dark, and in all three accents (blue, red, green)
- [ ] keyboard accessible: focus visible, reachable with tab, closable with esc where applicable
- [ ] docs updated if behaviour changed (`README.md`, `docs/`, `CHANGELOG.md`)

## code style

prettier and eslint are configured; `pnpm format` and `pnpm lint --fix` do most of the work. no semicolons, single quotes, 110 columns. strict typescript, no `any`. comments are lowercase and explain why, not what.

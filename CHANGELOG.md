# changelog

all notable changes to `type` are recorded here. the format follows [keep a changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [semantic versioning](https://semver.org/).

## [unreleased]

### added

- scratchpad editor: a plain, uncontrolled textarea that is focused and typeable at first paint
- up to 8 editors side by side with inline-editable titles, add, clear and close
- 26 text formats in four groups (case, lines, wrap, encode) available from the format menu, the command palette and shortcuts
- command palette (`mod+k`) searching formats and app commands by label and keywords
- compare view: git-style diff of any two editors, split or unified, line-level plus word-level highlights, swap a/b, persisted mode
- live stats in the editor footer: chars, words, lines, sentences and reading time
- copy the active editor with a button or `mod+shift+c`, with a toast
- keyboard shortcuts for every action and a shortcuts sheet on `?`
- light, dark and system themes with a circular-reveal view transition, three accents (blue, red, green)
- editor fonts: geist mono (default), newsreader (serif) and space grotesk (sans), the latter two loaded on demand
- persistence of editors and settings in localStorage with debounced writes, flush on pagehide and a one-time warning when storage is full
- pre-hydration script that applies the saved theme, accent and font before first paint
- optional google analytics 4, loaded lazily after the first interaction, respecting do not track and never receiving editor content
- bundle budget check (`pnpm size`) that fails when the entry chunk exceeds 95 kb gzipped or contains jsdiff
- unit tests with coverage thresholds and playwright end-to-end tests against the production build
- documentation: readme, contributing, security, architecture, formats, shortcuts, theming, performance

[unreleased]: https://github.com/sushilburagute/type/commits/main

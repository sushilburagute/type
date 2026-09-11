# performance

The critical path is deliberately small: a native uncontrolled textarea, React, Zustand, app chrome, and self-hosted Geist Mono. Comparison, the command palette, shortcut help, and alternate fonts load only when needed or are prefetched after interaction.

Current release gates:

- entry JavaScript: at most 95 KB gzip (`pnpm size`)
- jsdiff must remain outside the entry chunk
- no third-party network request before the first pointer or keyboard interaction
- fonts are self-hosted; analytics is disabled when its id is empty or Do Not Track is enabled

Run `pnpm build && pnpm size` to enforce the bundle contract. Use a production build for profiling; development Strict Mode intentionally does extra work.

The textarea owns keystrokes. Content reaches Zustand after a short debounce, statistics subscribe separately, and localStorage writes are coalesced. Programmatic edits increment an editor revision so only those operations resynchronize the textarea DOM.

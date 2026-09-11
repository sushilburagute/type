# formats

a format is a pure `(input: string) => string` function registered in `src/constants/formats.ts`. that file is the single source of truth: the format menu, the command palette and the keyboard shortcut map are all derived from it.

## adding a format

1. write the function in `src/utils/text/*.ts` (pick the file that matches its group, or add a new one). it must be pure, synchronous, return `''` for `''`, and never throw anything other than `FormatError`.
2. add a colocated `*.test.ts` with table-driven `it.each` cases. coverage for `src/utils/**` is 100% lines and functions, so cover every branch, including empty input and unicode (ß, é, emoji, cjk).
3. register it in `FORMATS` in `src/constants/formats.ts` with an `id`, `label`, `group`, `fn` and optional `keywords` (extra palette search terms) and `shortcut` (an id from `src/constants/shortcuts.ts`).
4. that's it. it now shows up in the format menu under its group, in the command palette (searchable by label and keywords), and on the shortcut it references, if any.

## error contract

when the input can't be transformed, throw a `FormatError` with a short lowercase message:

```ts
import { FormatError } from '@/types/format'

throw new FormatError('not valid json')
```

the store catches `FormatError`, leaves the editor content untouched and shows its message as a toast. unexpected errors also leave the content untouched and show a generic error toast. empty input must never throw; return `''`.

## naming rules

- `id`: kebab-case, stable, used in urls and tests (`sort-asc`, `json-pretty`).
- `label`: lowercase, short, human (`sort a→z`, `json pretty`). labels are shown verbatim.
- `keywords`: lowercase, things people might type that aren't in the label (`camelcase`, `uniq`, `b64`).
- functions: `verbNoun` (`toTitleCase`, `wrapInQuotes`, `dedupeLines`).

## line handling

line-based formats normalise `\r\n` / `\r` to `\n`, treat the text as a list of lines and preserve a trailing newline if the input had one. "non-blank" means the line has at least one non-whitespace character.

## current formats

| id                   | label              | group  |
| -------------------- | ------------------ | ------ |
| `lowercase`          | lowercase          | case   |
| `uppercase`          | uppercase          | case   |
| `title-case`         | title case         | case   |
| `sentence-case`      | sentence case      | case   |
| `camel-case`         | camel case         | case   |
| `snake-case`         | snake case         | case   |
| `kebab-case`         | kebab case         | case   |
| `trim`               | trim               | lines  |
| `collapse-spaces`    | collapse spaces    | lines  |
| `remove-empty-lines` | remove empty lines | lines  |
| `remove-line-breaks` | remove line breaks | lines  |
| `sort-asc`           | sort a→z           | lines  |
| `sort-desc`          | sort z→a           | lines  |
| `dedupe-lines`       | dedupe lines       | lines  |
| `reverse-lines`      | reverse lines      | lines  |
| `wrap-quotes`        | wrap in quotes     | wrap   |
| `wrap-backticks`     | wrap in backticks  | wrap   |
| `line-numbers`       | line numbers       | wrap   |
| `indent`             | indent             | wrap   |
| `dedent`             | dedent             | wrap   |
| `url-encode`         | url encode         | encode |
| `url-decode`         | url decode         | encode |
| `base64-encode`      | base64 encode      | encode |
| `base64-decode`      | base64 decode      | encode |
| `json-pretty`        | json pretty        | encode |
| `json-minify`        | json minify        | encode |

shortcuts: `uppercase`, `lowercase`, `title-case` and `json-pretty` are bound via `src/constants/shortcuts.ts`.

text stats (`src/utils/text/stats.ts`) are not a format; they're read-only and shown in the editor footer.

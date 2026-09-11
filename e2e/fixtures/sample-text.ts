/** three lines, mixed case and punctuation — enough to make case formats and diffs visibly change something */
export const SAMPLE =
  'Hello, World!\nthe quick brown Fox jumps over the lazy dog.\nDone: 3 lines, 2 sentences?'

export const SAMPLE_UPPER = SAMPLE.toUpperCase()

export const JSON_MINIFIED = '{"name":"type","tags":["fast","minimal"],"nested":{"ok":true,"count":2}}'

export const JSON_PRETTY = JSON.stringify(JSON.parse(JSON_MINIFIED), null, 2)

export const JSON_INVALID = '{"name": "type", "tags": [fast, minimal]'

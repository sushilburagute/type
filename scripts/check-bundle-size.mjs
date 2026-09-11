// fails the build when the entry chunk grows past the budget. run after `vite build`.
// react 19 + react-dom + scheduler account for roughly 70 kb gzipped of the entry; app code is the rest.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB ?? 95)
const dir = join(process.cwd(), 'dist', 'assets')

let entries
try {
  entries = readdirSync(dir).filter((f) => /^index-.*\.js$/.test(f))
} catch {
  console.error('dist/assets not found — run `pnpm build` first')
  process.exit(1)
}

let failed = false
for (const file of entries) {
  const path = join(dir, file)
  const gz = gzipSync(readFileSync(path)).length / 1024
  const raw = statSync(path).size / 1024
  const ok = gz <= BUDGET_KB
  if (!ok) failed = true
  console.log(
    `${ok ? 'ok ' : 'FAIL'} ${file}  ${raw.toFixed(1)} kb raw  ${gz.toFixed(1)} kb gz  (budget ${BUDGET_KB} kb gz)`,
  )
}

// the diff library must never end up in the entry chunk
for (const file of entries) {
  const src = readFileSync(join(dir, file), 'utf8')
  if (/diffWordsWithSpace|diffLines/.test(src)) {
    console.log(`FAIL ${file} contains jsdiff — it must stay in the lazy compare chunk`)
    failed = true
  }
}

process.exit(failed ? 1 : 0)

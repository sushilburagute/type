import { expect, type Page } from '@playwright/test'

/** clicks the nth editor textarea. required on the mobile project, where nothing is autofocused. */
export async function focusEditor(page: Page, index = 0): Promise<void> {
  const textarea = page.getByRole('textbox').nth(index)
  await textarea.click()
  await expect(textarea).toBeFocused()
}

export async function readClipboard(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText())
}

/** editors persist on a 300ms debounce (after a 50ms input debounce) — wait until the text has landed in storage */
export async function waitForPersist(page: Page, containing: string): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('type:editors') ?? ''), { timeout: 5_000 })
    .toContain(JSON.stringify(containing).slice(1, -1))
}

/** all requests the page makes from now on; register before `goto` so the document request is included */
export function collectRequests(page: Page): string[] {
  const urls: string[] = []
  page.on('request', (req) => urls.push(req.url()))
  return urls
}

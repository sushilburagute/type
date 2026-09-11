import { expect, test } from '@playwright/test'
import { collectRequests, focusEditor } from './helpers'

const ORIGIN = 'http://localhost:4173/'

test.describe('first interaction', () => {
  test('typing works immediately after load without clicking', async ({ page, isMobile }) => {
    const requests = collectRequests(page)
    await page.goto('/')

    // desktop autofocuses the textarea; a coarse pointer must not pop the keyboard unasked, so tap first
    if (isMobile) await focusEditor(page)
    await page.keyboard.type('hello')

    const textarea = page.getByRole('textbox').first()
    await expect(textarea).toHaveValue('hello')
    await expect(page.getByRole('region', { name: /^editor 1:/ }).locator('footer')).toContainText('5 chars')

    // fonts are self-hosted and analytics is off in ci: nothing may leave the origin
    expect(requests.length).toBeGreaterThan(0)
    for (const url of requests) {
      expect(url.startsWith(ORIGIN), `unexpected cross-origin request: ${url}`).toBe(true)
    }
  })

  test('the default font is the only font requested', async ({ page }) => {
    const requests = collectRequests(page)
    await page.goto('/')
    await expect(page.getByRole('textbox').first()).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    const woff2 = requests.filter((url) => url.endsWith('.woff2'))
    expect(woff2.length).toBeGreaterThanOrEqual(1)
    // latin-400 is preloaded from index.html; 700 may follow for the bold wordmark. both are geist mono.
    expect(woff2.filter((url) => url.includes('geist-mono-latin-400'))).toHaveLength(1)
    for (const url of woff2) {
      expect(url).toContain('geist-mono')
      expect(url).not.toContain('newsreader')
      expect(url).not.toContain('space-grotesk')
    }
  })

  test('every button has an accessible name', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('textbox').first()).toBeVisible()

    const unnamed = await page
      .locator('button')
      .evaluateAll((buttons) =>
        buttons
          .filter((b) => !(b.getAttribute('aria-label') ?? '').trim() && !(b.textContent ?? '').trim())
          .map((b) => b.outerHTML.slice(0, 120)),
      )
    expect(await page.locator('button').count()).toBeGreaterThan(0)
    expect(unnamed).toEqual([])
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      'page must not scroll horizontally',
    ).toBe(false)
  })
})

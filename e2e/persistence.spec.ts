import { expect, test } from '@playwright/test'
import { SAMPLE } from './fixtures/sample-text'
import { focusEditor, waitForPersist } from './helpers'

declare global {
  interface Window {
    __themeAtDcl?: string
  }
}

test.describe('persistence', () => {
  test('text and settings survive a reload without a flash of the wrong theme', async ({
    page,
    isMobile,
  }) => {
    // records what the pre-hydration script left on <html> at the earliest observable moment after reload
    await page.addInitScript(() => {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          window.__themeAtDcl = document.documentElement.dataset.theme
        },
        { once: true },
      )
    })

    await page.goto('/')
    const textarea = page.getByRole('textbox').first()
    if (isMobile) await focusEditor(page)
    else await expect(textarea).toBeFocused()
    await textarea.fill(SAMPLE)

    const html = page.locator('html')
    await page.getByRole('button', { name: 'menu' }).click()

    // theme cycles system → light → dark
    const themeToggle = page.getByRole('button', { name: /^theme:/ })
    for (let i = 0; i < 3 && (await themeToggle.getAttribute('data-theme-value')) !== 'dark'; i++) {
      const before = (await themeToggle.getAttribute('data-theme-value')) ?? ''
      await themeToggle.click()
      await expect(themeToggle).not.toHaveAttribute('data-theme-value', before)
    }
    await expect(themeToggle).toHaveAttribute('data-theme-value', 'dark')
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('radiogroup', { name: 'accent colour' }).getByRole('radio', { name: 'red' }).click()
    await expect(html).toHaveAttribute('data-accent', 'red')

    // the serif chunk + face load before the switch happens
    await page.getByRole('radiogroup', { name: 'editor font' }).getByRole('radio', { name: 'serif' }).click()
    await expect(html).toHaveAttribute('data-font', 'serif', { timeout: 10_000 })

    await waitForPersist(page, SAMPLE)
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('type:settings') ?? '{}').state))
      .toMatchObject({ theme: 'dark', accent: 'red', font: 'serif' })

    await page.reload()

    const restored = page.getByRole('textbox').first()
    await expect(restored).toHaveValue(SAMPLE)
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(html).toHaveAttribute('data-accent', 'red')
    await expect(html).toHaveAttribute('data-font', 'serif')
    expect(await restored.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Newsreader')
    // no flash: the theme was already dark before react hydrated
    expect(await page.evaluate(() => window.__themeAtDcl)).toBe('dark')
  })
})

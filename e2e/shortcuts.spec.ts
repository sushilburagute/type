import { expect, test } from '@playwright/test'
import { readClipboard } from './helpers'

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('textbox').first()).toBeFocused()
  })

  test('mod+shift+n adds an editor and focuses it', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+Shift+n')
    await expect(page.getByRole('region', { name: /^editor \d+:/ })).toHaveCount(2)
    await expect(page.getByRole('textbox').nth(1)).toBeFocused()
  })

  test('mod+k opens the palette and enter runs the highlighted command', async ({ page }) => {
    const textarea = page.getByRole('textbox').first()
    await textarea.fill('Hello Big World')

    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.getByRole('dialog', { name: 'command palette' })
    await expect(palette).toBeVisible()
    await palette.getByRole('combobox', { name: 'search commands' }).fill('kebab')
    await expect(palette.getByRole('option', { name: /kebab case/ })).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Enter')

    await expect(palette).toBeHidden()
    await expect(textarea).toHaveValue('hello-big-world')
  })

  test('mod+shift+c copies the active editor', async ({ page }) => {
    const text = 'copy me via shortcut'
    await page.getByRole('textbox').first().fill(text)
    await page.keyboard.press('ControlOrMeta+Shift+c')
    await expect(page.getByRole('status').filter({ hasText: 'copied' })).toBeVisible()
    expect(await readClipboard(page)).toBe(text)
  })

  test('mod+/ toggles the theme', async ({ page }) => {
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')
    await page.keyboard.press('ControlOrMeta+/')
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await page.keyboard.press('ControlOrMeta+/')
    await expect(html).toHaveAttribute('data-theme', 'light')
  })

  test('? opens the shortcuts sheet when the editor is not focused', async ({ page }) => {
    // blur the textarea: the wordmark is not focusable, so focus falls back to the body
    await page.getByRole('heading', { level: 1, name: 'type' }).click()
    await expect(page.getByRole('textbox').first()).not.toBeFocused()

    await page.keyboard.press('?')
    const sheet = page.getByRole('dialog', { name: 'keyboard shortcuts' })
    await expect(sheet).toBeVisible()
    await expect(sheet).toContainText('command palette')

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })
})

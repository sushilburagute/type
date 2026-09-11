import { expect, test } from '@playwright/test'
import { JSON_INVALID, JSON_MINIFIED, JSON_PRETTY, SAMPLE, SAMPLE_UPPER } from './fixtures/sample-text'
import { readClipboard } from './helpers'

test.describe('format and copy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('textbox').first()).toBeFocused()
  })

  test('uppercase via the format menu, then copy', async ({ page }) => {
    const textarea = page.getByRole('textbox').first()
    await textarea.fill(SAMPLE)

    await page.getByRole('button', { name: 'format', exact: true }).click()
    const menu = page.getByRole('menu', { name: 'formats' })
    await expect(menu).toBeVisible()
    await menu.getByRole('menuitem', { name: 'uppercase', exact: true }).click()

    await expect(menu).toBeHidden()
    await expect(textarea).toHaveValue(SAMPLE_UPPER)

    await page.getByRole('button', { name: 'copy', exact: true }).click()
    await expect(page.getByRole('status').filter({ hasText: 'copied' })).toBeVisible()
    expect((await readClipboard(page)).replace(/\r\n/g, '\n')).toBe(SAMPLE_UPPER)
  })

  test('json pretty via the command palette', async ({ page }) => {
    const textarea = page.getByRole('textbox').first()
    await textarea.fill(JSON_MINIFIED)

    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.getByRole('dialog', { name: 'command palette' })
    await expect(palette).toBeVisible()
    const search = palette.getByRole('combobox', { name: 'search commands' })
    await expect(search).toBeFocused()
    await search.fill('json pretty')
    await expect(palette.getByRole('option', { name: /json pretty/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.keyboard.press('Enter')

    await expect(palette).toBeHidden()
    await expect(textarea).toHaveValue(JSON_PRETTY)
  })

  test('json pretty on invalid json toasts and leaves the text alone', async ({ page }) => {
    const textarea = page.getByRole('textbox').first()
    await textarea.fill(JSON_INVALID)

    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.getByRole('dialog', { name: 'command palette' })
    await palette.getByRole('combobox', { name: 'search commands' }).fill('json pretty')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('status').filter({ hasText: 'not valid json' })).toBeVisible()
    await expect(textarea).toHaveValue(JSON_INVALID)
  })
})

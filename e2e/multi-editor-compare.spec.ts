import { expect, test, type Page } from '@playwright/test'

const editors = (page: Page) => page.getByRole('region', { name: /^editor \d+:/ })

test.describe('multiple editors and compare', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('textbox').first()).toBeFocused()
  })

  test('adds a second editor, diffs the two, switches layout and closes', async ({ page }) => {
    await page.keyboard.type('alpha\nbeta\ngamma')

    await page.keyboard.press('ControlOrMeta+Shift+n')
    await expect(editors(page)).toHaveCount(2)
    const second = page.getByRole('textbox').nth(1)
    await expect(second).toBeFocused()
    await page.keyboard.type('alpha\nbeta changed\ngamma\ndelta')

    const compareButton = page.getByRole('button', { name: 'compare editors' })
    await expect(compareButton).toBeEnabled()
    await compareButton.click()

    const dialog = page.getByRole('dialog', { name: 'compare editors' })
    await expect(dialog).toBeVisible()
    const view = dialog.getByTestId('diff-view')
    await expect(view).toHaveAttribute('data-mode', 'split')
    await expect(view.locator('[data-kind="remove"]').first()).toBeVisible()
    await expect(view.locator('[data-kind="add"]').first()).toBeVisible()
    await expect(view.locator('[data-kind="equal"]').first()).toBeVisible()

    await dialog
      .getByRole('radiogroup', { name: 'diff layout' })
      .getByRole('radio', { name: 'unified' })
      .click()
    await expect(view).toHaveAttribute('data-mode', 'unified')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('closing an editor with text asks for confirmation', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'close editor' })).toBeDisabled()
    await expect(page.getByRole('button', { name: /^compare/ })).toBeDisabled()

    await page.getByRole('button', { name: 'new editor' }).click()
    await expect(editors(page)).toHaveCount(2)
    const second = page.getByRole('textbox').nth(1)
    await expect(second).toBeFocused()
    await page.keyboard.type('some text worth a warning')

    const closeButtons = page.getByRole('button', { name: 'close editor' })
    await expect(closeButtons.nth(1)).toBeEnabled()

    // dismissing the confirm keeps the editor
    page.once('dialog', (d) => {
      expect(d.type()).toBe('confirm')
      void d.dismiss()
    })
    await closeButtons.nth(1).click()
    await expect(editors(page)).toHaveCount(2)

    // accepting removes it
    page.once('dialog', (d) => void d.accept())
    await closeButtons.nth(1).click()
    await expect(editors(page)).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'close editor' })).toBeDisabled()
  })
})

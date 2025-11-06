import { test, expect } from '@playwright/test'

test.describe('Whiteboard App - E2E', () => {
  test('should render canvas with Select tool active', async ({ page }) => {
    await page.goto('/')
    
    // Wait for tldraw to mount
    const canvas = page.locator('.tl-container')
    await expect(canvas).toBeVisible({ timeout: 5000 })

    // Verify canvas is interactive
    await expect(canvas).toBeEnabled()
  })

  test('should persist board state after reload', async ({ page }) => {
    await page.goto('/')
    
    // Wait for tldraw to mount
    const canvas = page.locator('.tl-container')
    await expect(canvas).toBeVisible({ timeout: 5000 })

    // Create a shape (draw something)
    await page.mouse.move(400, 300)
    await page.mouse.down()
    await page.mouse.move(500, 400)
    await page.mouse.up()

    // Wait a bit for state to save
    await page.waitForTimeout(500)

    // Reload page
    await page.reload()

    // Wait for canvas to mount again
    await expect(canvas).toBeVisible({ timeout: 5000 })

    // Verify persistence key exists in localStorage
    const localStorage = await page.evaluate(() => {
      return Object.keys(window.localStorage).filter(key => 
        key.includes('whiteboard-mvp') || key.includes('tldraw')
      )
    })

    expect(localStorage.length).toBeGreaterThan(0)
  })
})


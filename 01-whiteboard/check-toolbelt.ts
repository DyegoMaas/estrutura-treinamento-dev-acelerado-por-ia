import { chromium } from 'playwright'

async function checkToolbelt() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  try {
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' })
    
    // Wait for tldraw to load
    await page.waitForSelector('.tl-container', { timeout: 10000 })
    
    // Wait for UI to fully render
    await page.waitForTimeout(3000)
    
    // Take full page screenshot first
    await page.screenshot({ path: 'full-page-screenshot.png', fullPage: true })
    console.log('Full page screenshot saved')
    
    // Try to find toolbelt in different ways
    const selectors = [
      '.tl-toolbar',
      '[data-testid="tools"]',
      '[aria-label*="tool"]',
      '.tl-toolbar-list',
      '.tl-toolbar-group',
      'button[aria-label*="Select"]',
      'button[aria-label*="Draw"]',
      'button[aria-label*="Arrow"]'
    ]
    
    for (const selector of selectors) {
      const element = await page.locator(selector).first()
      if (await element.count() > 0) {
        console.log(`Found element with selector: ${selector}`)
        await element.screenshot({ path: `toolbelt-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png` })
      }
    }
    
    // Find all buttons that might be tools
    const allButtons = await page.locator('button').all()
    console.log(`\nFound ${allButtons.length} buttons total`)
    
    const toolButtons = []
    for (const button of allButtons) {
      const ariaLabel = await button.getAttribute('aria-label')
      const text = await button.textContent()
      const classes = await button.getAttribute('class')
      
      if (ariaLabel?.toLowerCase().includes('tool') || 
          ariaLabel?.toLowerCase().includes('select') ||
          ariaLabel?.toLowerCase().includes('draw') ||
          ariaLabel?.toLowerCase().includes('arrow') ||
          ariaLabel?.toLowerCase().includes('card') ||
          classes?.includes('tool')) {
        toolButtons.push({
          ariaLabel: ariaLabel || '',
          text: text?.trim() || '',
          classes: classes || ''
        })
      }
    }
    
    console.log('\nTool buttons found:')
    toolButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. ${btn.ariaLabel || btn.text || 'no label'} (classes: ${btn.classes})`)
    })
    
    // Check specifically for Card
    const cardButtons = await page.locator('button:has-text("Card"), button[aria-label*="Card"], button[aria-label*="card"]').all()
    console.log(`\nCard tool buttons found: ${cardButtons.length}`)
    
    if (cardButtons.length === 0) {
      console.log('\n⚠️ Card tool NOT found in toolbelt!')
    } else {
      console.log('\n✅ Card tool found!')
    }
    
  } catch (error) {
    console.error('Error:', error)
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true })
  } finally {
    await browser.close()
  }
}

checkToolbelt().catch(console.error)

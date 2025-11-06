import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { Minimap } from './Minimap'

// Note: For full integration tests, we'd need to properly mock tldraw hooks
// These tests verify basic structure and visibility logic

describe('Minimap Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should render minimap when visible prop is true', async () => {
    const { container } = render(
      <div style={{ position: 'relative', width: '800px', height: '600px' }}>
        <Tldraw persistenceKey="test-minimap-1">
          <Minimap visible={true} />
        </Tldraw>
      </div>
    )

    await waitFor(() => {
      const canvas = document.querySelector('.tl-container')
      expect(canvas).toBeInTheDocument()
    }, { timeout: 2000 })

    // Wait a bit more for minimap to render
    await waitFor(() => {
      const minimap = container.querySelector('[data-testid="minimap"]')
      expect(minimap).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should not render minimap when visible prop is false', async () => {
    const { container } = render(
      <div style={{ position: 'relative', width: '800px', height: '600px' }}>
        <Tldraw persistenceKey="test-minimap">
          <Minimap visible={false} />
        </Tldraw>
      </div>
    )

    await waitFor(() => {
      const canvas = document.querySelector('.tl-container')
      expect(canvas).toBeInTheDocument()
    }, { timeout: 2000 })

    // Minimap should not be rendered
    const minimap = container.querySelector('[data-testid="minimap"]')
    expect(minimap).not.toBeInTheDocument()
  })

  it('should render viewport rectangle in minimap', async () => {
    const { container } = render(
      <div style={{ position: 'relative', width: '800px', height: '600px' }}>
        <Tldraw persistenceKey="test-minimap">
          <Minimap visible={true} />
        </Tldraw>
      </div>
    )

    await waitFor(() => {
      const canvas = document.querySelector('.tl-container')
      expect(canvas).toBeInTheDocument()
    }, { timeout: 2000 })

    // Wait a bit for minimap to render
    await waitFor(() => {
      const viewportRect = container.querySelector('[data-testid="minimap-viewport"]')
      expect(viewportRect).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})


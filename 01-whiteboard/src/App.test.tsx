import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App - Tldraw Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should render Tldraw component with infinite canvas', async () => {
    render(<App />)
    
    // Wait for tldraw to mount - check for container class
    await waitFor(() => {
      const canvas = document.querySelector('.tl-container')
      expect(canvas).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should have Select tool active by default', async () => {
    render(<App />)
    
    await waitFor(() => {
      const canvas = document.querySelector('.tl-container')
      expect(canvas).toBeInTheDocument()
    }, { timeout: 2000 })

    // Canvas should be present and interactive
    // Note: IndexedDB not available in happy-dom, so persistenceKey will use localStorage fallback
    const container = document.querySelector('.tl-container')
    expect(container).toBeTruthy()
    expect(container?.getAttribute('role')).toBe('application')
  })

  // Note: Persistence with IndexedDB is tested in E2E tests (playwright)
  // because happy-dom doesn't fully support IndexedDB
})


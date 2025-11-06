import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'

// Mock window.alert for tldraw compatibility
global.alert = vi.fn(() => {})

afterEach(() => {
  cleanup()
})


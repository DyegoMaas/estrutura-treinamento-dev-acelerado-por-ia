import { useState, useEffect } from 'react'

const STORAGE_KEY = 'minimap-visible'

/**
 * Hook to manage minimap visibility state with localStorage persistence
 * @returns [visible, toggle] - visible state and toggle function
 */
export function useMinimapState(): [boolean, () => void] {
  const [visible, setVisible] = useState<boolean>(() => {
    // Initialize from localStorage or default to false
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  })

  useEffect(() => {
    // Persist state to localStorage whenever it changes
    localStorage.setItem(STORAGE_KEY, String(visible))
  }, [visible])

  const toggle = () => {
    setVisible(prev => !prev)
  }

  return [visible, toggle]
}

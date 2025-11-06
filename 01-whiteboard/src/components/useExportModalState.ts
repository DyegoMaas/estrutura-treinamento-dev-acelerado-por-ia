import { useState } from 'react'

/**
 * Hook to manage export modal visibility state
 * Persists preference in localStorage
 */
export function useExportModalState() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  return [isOpen, { open, close, toggle }] as const
}


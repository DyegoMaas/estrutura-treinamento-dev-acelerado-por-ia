import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'whiteboard-theme'

/**
 * Get initial theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }
  // Fallback to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * Apply theme to document root
 */
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

/**
 * Hook to manage theme state (light/dark)
 * Persists preference in localStorage
 */
export function useThemeState() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Apply theme on initial mount
  useEffect(() => {
    const initialTheme = getInitialTheme()
    applyTheme(initialTheme)
  }, [])

  // Save to localStorage and apply theme whenever theme changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return [theme, { toggleTheme, setTheme: setThemeValue }] as const
}


import { useEditor } from '@tldraw/tldraw'
import { useEffect } from 'react'
import { useThemeState } from './useThemeState'

/**
 * Toggle button component for theme (light/dark)
 * Updates tldraw editor theme via user preferences
 */
export function ThemeToggle() {
  const [theme, { toggleTheme }] = useThemeState()
  const editor = useEditor()

  // Update tldraw editor theme when our theme changes
  useEffect(() => {
    if (editor) {
      editor.user.updateUserPreferences({
        colorScheme: theme,
      })
    }
  }, [theme, editor])

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
      data-testid="theme-toggle"
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        padding: '8px 12px',
        border: '1px solid #999',
        borderRadius: '4px',
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        zIndex: 1001,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Escuro' : 'Claro'}
    </button>
  )
}


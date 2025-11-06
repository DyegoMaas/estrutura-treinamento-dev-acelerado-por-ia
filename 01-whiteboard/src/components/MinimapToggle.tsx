import { useMinimapState } from './useMinimapState'

/**
 * Toggle button component for minimap visibility
 * Positioned to not overlap with minimap when visible
 */
export function MinimapToggle() {
  const [visible, toggle] = useMinimapState()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={visible ? 'Ocultar minimap' : 'Mostrar minimap'}
      data-testid="minimap-toggle"
      style={{
        position: 'absolute',
        bottom: visible ? 175 : 16, // Move up when minimap is visible
        right: 16,
        padding: '8px 12px',
        border: '1px solid #999',
        borderRadius: '4px',
        background: visible ? '#3b82f6' : '#fff',
        color: visible ? '#fff' : '#333',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        zIndex: 1001,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'bottom 0.2s ease',
      }}
    >
      {visible ? '▼' : '▲'} Minimap
    </button>
  )
}

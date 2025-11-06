import { useExportModalState } from './useExportModalState'
import { ExportModal } from './ExportModal'

/**
 * Toggle button component for export modal
 * Positioned to not overlap with other UI elements
 */
export function ExportToggle() {
  const [isOpen, { open, close }] = useExportModalState()

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Exportar whiteboard"
        data-testid="export-toggle"
        style={{
          position: 'absolute',
          top: 50,
          left: 16,
          padding: '8px 12px',
          border: '1px solid #999',
          borderRadius: '4px',
          background: '#fff',
          color: '#333',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 1001,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        📥 Exportar
      </button>
      <ExportModal isOpen={isOpen} onClose={close} />
    </>
  )
}


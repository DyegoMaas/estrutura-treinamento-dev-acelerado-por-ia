import { useEditor, getSnapshot } from '@tldraw/tldraw'
import { useState, useEffect } from 'react'

type ExportFormat = 'svg' | 'png' | 'json'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Export modal component (simulated export - RF-9)
 * Shows preview of SVG/JSON without downloading files
 * PNG is disabled with tooltip explanation
 */
export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const editor = useEditor()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('svg')
  const [preview, setPreview] = useState<string>('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Generate preview when format changes or modal opens
  useEffect(() => {
    if (!isOpen) {
      setPreview('')
      setShowSuccess(false)
      return
    }

    setIsLoading(true)
    
    // Small delay to show loading state
    const timer = setTimeout(async () => {
      try {
        if (selectedFormat === 'svg') {
          // Get all shapes from the editor
          const shapes = editor.getCurrentPageShapes()
          if (shapes.length === 0) {
            setPreview('Nenhum conteúdo para exportar')
            setIsLoading(false)
            return
          }
          
          // For simulated export, we'll create a simple SVG representation
          // In a real implementation, we would use editor.toImage() or exportAs()
          // For now, show a preview message with shape count
          const shapeCount = shapes.length
          const previewText = `Preview SVG (simulado)\n\nTotal de formas: ${shapeCount}\n\nEste preview mostra o número de elementos que seriam exportados.\n\nEm uma implementação real, o SVG completo seria exibido aqui.`
          setPreview(previewText)
          setIsLoading(false)
        } else if (selectedFormat === 'json') {
          // Get snapshot from store using getSnapshot utility
          const snapshot = getSnapshot(editor.store)
          const jsonString = JSON.stringify(snapshot, null, 2)
          setPreview(jsonString)
        }
        setShowSuccess(false)
      } catch (error) {
        console.error('Error generating preview:', error)
        setPreview('Erro ao gerar preview')
      } finally {
        setIsLoading(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isOpen, selectedFormat, editor])

  const handleClose = () => {
    setShowSuccess(false)
    setPreview('')
    onClose()
  }

  const handleExport = () => {
    // Simulated export - just show success feedback (RF-9)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={handleClose}
      data-testid="export-modal-overlay"
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="export-modal"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Exportar Whiteboard</h2>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        {/* Format selection */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setSelectedFormat('svg')}
            style={{
              padding: '10px 20px',
              border: `2px solid ${selectedFormat === 'svg' ? '#3b82f6' : '#ddd'}`,
              borderRadius: '4px',
              background: selectedFormat === 'svg' ? '#eff6ff' : '#fff',
              color: selectedFormat === 'svg' ? '#3b82f6' : '#333',
              cursor: 'pointer',
              fontWeight: selectedFormat === 'svg' ? 600 : 400,
            }}
            data-testid="export-format-svg"
          >
            SVG
          </button>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              disabled
              style={{
                padding: '10px 20px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                background: '#f5f5f5',
                color: '#999',
                cursor: 'not-allowed',
                fontWeight: 400,
                position: 'relative',
              }}
              data-testid="export-format-png"
              title="PNG não disponível no MVP (será implementado em versão futura)"
            >
              PNG
            </button>
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '8px',
                padding: '8px 12px',
                background: '#333',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
              }}
              className="png-tooltip"
            >
              PNG não disponível no MVP
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFormat('json')}
            style={{
              padding: '10px 20px',
              border: `2px solid ${selectedFormat === 'json' ? '#3b82f6' : '#ddd'}`,
              borderRadius: '4px',
              background: selectedFormat === 'json' ? '#eff6ff' : '#fff',
              color: selectedFormat === 'json' ? '#3b82f6' : '#333',
              cursor: 'pointer',
              fontWeight: selectedFormat === 'json' ? 600 : 400,
            }}
            data-testid="export-format-json"
          >
            JSON
          </button>
        </div>

        {/* Preview area */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '16px',
            minHeight: '300px',
            maxHeight: '400px',
            overflow: 'auto',
            background: '#f9f9f9',
            marginBottom: '20px',
            position: 'relative',
          }}
          data-testid="export-preview"
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Gerando preview...
            </div>
          ) : preview ? (
            <pre
              style={{
                margin: 0,
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {preview.substring(0, 5000)}
              {preview.length > 5000 && '\n\n... (truncado)'}
            </pre>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Selecione um formato para ver o preview
            </div>
          )}
        </div>

        {/* Success feedback */}
        {showSuccess && (
          <div
            style={{
              padding: '12px',
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '4px',
              color: '#065f46',
              marginBottom: '16px',
              textAlign: 'center',
            }}
            data-testid="export-success-message"
          >
            ✓ Exportação simulada realizada com sucesso!
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff',
              color: '#333',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading || !preview || selectedFormat === 'png'}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              background: preview && !isLoading && selectedFormat !== 'png' ? '#3b82f6' : '#ccc',
              color: '#fff',
              cursor: preview && !isLoading && selectedFormat !== 'png' ? 'pointer' : 'not-allowed',
              fontWeight: 600,
            }}
            data-testid="export-button"
          >
            Exportar (Simulado)
          </button>
        </div>
      </div>
    </div>
  )
}


import { useEditor, useValue } from '@tldraw/tldraw'
import { Box } from '@tldraw/editor'

interface MinimapProps {
  visible: boolean
}

/**
 * Minimap component that shows an overview of the canvas with viewport rectangle
 * Displays the current camera viewport as a highlighted rectangle
 */
export function Minimap({ visible }: MinimapProps) {
  const editor = useEditor()

  // Subscribe to camera changes for reactivity (trigger re-render on camera change)
  useValue('camera', () => editor.getCamera(), [editor])
  
  // Get viewport page bounds
  const viewportPageBounds = useValue('viewportPageBounds', () => editor.getViewportPageBounds(), [editor])

  // Get bounds of all shapes to determine canvas bounds
  const bounds = useValue('bounds', () => {
    const allShapes = editor.getCurrentPageShapes()
    if (allShapes.length === 0) {
      // Default bounds if no shapes
      return new Box(0, 0, 1000, 1000)
    }
    
    // Calculate bounds from all shapes
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const shape of allShapes) {
      const shapeBounds = editor.getShapePageBounds(shape.id)
      if (shapeBounds) {
        minX = Math.min(minX, shapeBounds.x)
        minY = Math.min(minY, shapeBounds.y)
        maxX = Math.max(maxX, shapeBounds.x + shapeBounds.w)
        maxY = Math.max(maxY, shapeBounds.y + shapeBounds.h)
      }
    }

    // Default bounds if no valid shapes
    if (minX === Infinity) {
      return new Box(0, 0, 1000, 1000)
    }

    // Add some padding
    const padding = 100
    return new Box(
      minX - padding,
      minY - padding,
      maxX - minX + padding * 2,
      maxY - minY + padding * 2
    )
  }, [editor])

  if (!visible) {
    return null
  }

  // Minimap dimensions
  const minimapWidth = 200
  const minimapHeight = 150

  // Calculate scale to fit canvas bounds in minimap
  const scaleX = minimapWidth / bounds.width
  const scaleY = minimapHeight / bounds.height
  const scale = Math.min(scaleX, scaleY, 0.1) // Max 10% scale

  // Calculate viewport rectangle position in minimap coordinates
  const viewportX = (viewportPageBounds.x - bounds.x) * scale
  const viewportY = (viewportPageBounds.y - bounds.y) * scale
  const viewportRectWidth = viewportPageBounds.width * scale
  const viewportRectHeight = viewportPageBounds.height * scale

  return (
    <div
      data-testid="minimap"
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: minimapWidth,
        height: minimapHeight,
        border: '1px solid #999',
        borderRadius: '4px',
        background: '#fff',
        opacity: 0.9,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <svg
        width={minimapWidth}
        height={minimapHeight}
        style={{ display: 'block' }}
      >
        {/* Canvas background */}
        <rect
          x={0}
          y={0}
          width={minimapWidth}
          height={minimapHeight}
          fill="#f5f5f5"
        />

        {/* Viewport rectangle (highlighted) */}
        <rect
          data-testid="minimap-viewport"
          x={Math.max(0, viewportX)}
          y={Math.max(0, viewportY)}
          width={Math.min(viewportRectWidth, minimapWidth - Math.max(0, viewportX))}
          height={Math.min(viewportRectHeight, minimapHeight - Math.max(0, viewportY))}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          rx="2"
        />
      </svg>
    </div>
  )
}

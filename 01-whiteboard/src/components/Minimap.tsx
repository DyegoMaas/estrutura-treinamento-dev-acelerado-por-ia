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

  // Get all shapes for rendering
  const shapes = useValue('shapes', () => editor.getCurrentPageShapes(), [editor])

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
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Canvas background */}
        <rect
          x={0}
          y={0}
          width={minimapWidth}
          height={minimapHeight}
          fill="#f5f5f5"
        />

        {/* Render shapes */}
        {shapes.map(shape => {
          const shapeBounds = editor.getShapePageBounds(shape.id)
          if (!shapeBounds) return null

          // Convert shape bounds to minimap coordinates
          const shapeX = (shapeBounds.x - bounds.x) * scale
          const shapeY = (shapeBounds.y - bounds.y) * scale
          const shapeWidth = shapeBounds.w * scale
          const shapeHeight = shapeBounds.h * scale

          // Skip if shape is outside minimap bounds
          if (
            shapeX + shapeWidth < 0 ||
            shapeX > minimapWidth ||
            shapeY + shapeHeight < 0 ||
            shapeY > minimapHeight
          ) {
            return null
          }

          // Render based on shape type
          const shapeType = shape.type
          
          if (shapeType === 'arrow') {
            // For arrows, get start and end points from props
            const arrowShape = shape as any
            const start = arrowShape.props?.start
            const end = arrowShape.props?.end
            
            if (start && end && typeof start.x === 'number' && typeof end.x === 'number') {
              const startX = (start.x - bounds.x) * scale
              const startY = (start.y - bounds.y) * scale
              const endX = (end.x - bounds.x) * scale
              const endY = (end.y - bounds.y) * scale
              
              return (
                <line
                  key={shape.id}
                  x1={Math.max(0, Math.min(minimapWidth, startX))}
                  y1={Math.max(0, Math.min(minimapHeight, startY))}
                  x2={Math.max(0, Math.min(minimapWidth, endX))}
                  y2={Math.max(0, Math.min(minimapHeight, endY))}
                  stroke="#3b82f6"
                  strokeWidth={Math.max(1, scale * 3)}
                  opacity={0.7}
                  markerEnd="url(#arrowhead)"
                />
              )
            }
            
            // Fallback: render as rectangle
            return (
              <rect
                key={shape.id}
                x={Math.max(0, shapeX)}
                y={Math.max(0, shapeY)}
                width={Math.min(shapeWidth, minimapWidth - Math.max(0, shapeX))}
                height={Math.min(shapeHeight, minimapHeight - Math.max(0, shapeY))}
                fill="#3b82f6"
                fillOpacity={0.2}
                stroke="#3b82f6"
                strokeWidth={Math.max(0.5, scale)}
                opacity={0.6}
              />
            )
          } else if (shapeType === 'draw' || shapeType === 'geo') {
            // For draw shapes and geo shapes, render as rectangle
            return (
              <rect
                key={shape.id}
                x={Math.max(0, shapeX)}
                y={Math.max(0, shapeY)}
                width={Math.min(shapeWidth, minimapWidth - Math.max(0, shapeX))}
                height={Math.min(shapeHeight, minimapHeight - Math.max(0, shapeY))}
                fill="#888"
                fillOpacity={0.3}
                stroke="#666"
                strokeWidth={Math.max(0.5, scale)}
                opacity={0.7}
              />
            )
          } else if (shapeType === 'card') {
            // For card shapes, render as rectangle with stroke
            return (
              <rect
                key={shape.id}
                x={Math.max(0, shapeX)}
                y={Math.max(0, shapeY)}
                width={Math.min(shapeWidth, minimapWidth - Math.max(0, shapeX))}
                height={Math.min(shapeHeight, minimapHeight - Math.max(0, shapeY))}
                fill="#3b82f6"
                fillOpacity={0.2}
                stroke="#3b82f6"
                strokeWidth={Math.max(0.5, scale)}
                opacity={0.8}
                rx={scale * 4}
              />
            )
          }

          // Default: render as rectangle
          return (
            <rect
              key={shape.id}
              x={Math.max(0, shapeX)}
              y={Math.max(0, shapeY)}
              width={Math.min(shapeWidth, minimapWidth - Math.max(0, shapeX))}
              height={Math.min(shapeHeight, minimapHeight - Math.max(0, shapeY))}
              fill="#888"
              fillOpacity={0.3}
              stroke="#666"
              strokeWidth={Math.max(0.5, scale)}
              opacity={0.6}
            />
          )
        })}

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

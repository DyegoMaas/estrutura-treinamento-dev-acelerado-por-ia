import {
  ShapeUtil,
  Rectangle2d,
  HTMLContainer,
  getDefaultColorTheme,
  useEditor,
  type SvgExportContext,
} from '@tldraw/tldraw'
import React from 'react'
import type { CardShape } from '../types/card'

export class CardShapeUtil extends ShapeUtil<CardShape> {
  static override type = 'card' as const

  getDefaultProps(): CardShape['props'] {
    return {
      w: 200,
      h: 150,
      title: '',
      label: '',
      fill: '#ffffff',
      stroke: '#000000',
    }
  }

  getGeometry(shape: CardShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  canEdit() {
    return true
  }

  component(shape: CardShape) {
    return <CardComponent shape={shape} util={this} />
  }

  indicator(shape: CardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }

  toSvg(shape: CardShape, _ctx: SvgExportContext) {
    const { w, h, fill, stroke, title, label } = shape.props
    const theme = getDefaultColorTheme({ isDarkMode: false })

    return (
      <g>
        <rect
          width={w}
          height={h}
          fill={fill || String(theme.background)}
          stroke={stroke || String(theme.black)}
          strokeWidth={2}
          rx={4}
        />
        {title && (
          <text
            x={w / 2}
            y={h / 3}
            textAnchor="middle"
            fontSize={16}
            fontWeight="bold"
            fill={String(theme.text)}
          >
            {title}
          </text>
        )}
        {label && (
          <text
            x={w / 2}
            y={(h * 2) / 3}
            textAnchor="middle"
            fontSize={12}
            fill={String(theme.text)}
          >
            {label}
          </text>
        )}
      </g>
    )
  }
}

function CardComponent({ shape }: { shape: CardShape; util: CardShapeUtil }) {
  const editor = useEditor()
  const { w, h, title, label, fill, stroke } = shape.props
  const theme = getDefaultColorTheme({ isDarkMode: false })
  const isEditing = editor.getEditingShapeId() === shape.id

  const titleInputRef = React.useRef<HTMLInputElement>(null)
  const labelInputRef = React.useRef<HTMLInputElement>(null)

  // Auto-focus title input when entering edit mode
  React.useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditing])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor.updateShapes([
      {
        id: shape.id,
        type: 'card',
        props: { title: e.target.value },
      },
    ])
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor.updateShapes([
      {
        id: shape.id,
        type: 'card',
        props: { label: e.target.value },
      },
    ])
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    editor.setEditingShape(shape.id)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    // Always stop propagation to prevent tldraw from interfering
    e.stopPropagation()
  }

  // Handle Enter key when shape is selected but not editing
  React.useEffect(() => {
    if (!isEditing) {
      const handleKeyDown = (e: KeyboardEvent) => {
        const selectedShapes = editor.getSelectedShapes()
        if (
          selectedShapes.length === 1 &&
          selectedShapes[0].id === shape.id &&
          e.key === 'Enter' &&
          !isInputFocused()
        ) {
          e.preventDefault()
          editor.setEditingShape(shape.id)
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, shape.id, isEditing])

  // Helper to check if input is focused
  function isInputFocused(): boolean {
    const activeElement = document.activeElement
    if (!activeElement) return false
    const tagName = activeElement.tagName.toLowerCase()
    return tagName === 'input' || tagName === 'textarea'
  }

  return (
    <HTMLContainer
      style={{
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          backgroundColor: fill || theme.background,
          border: `2px solid ${stroke || theme.black}`,
          borderRadius: '4px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          cursor: isEditing ? 'text' : 'default',
        }}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
      >
        <input
          ref={titleInputRef}
          data-card-title
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Title"
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '16px',
            fontWeight: 'bold',
            outline: 'none',
            width: '100%',
            color: theme.text,
            cursor: isEditing ? 'text' : 'pointer',
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (!isEditing) {
              editor.setEditingShape(shape.id)
            }
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Escape') {
              editor.setEditingShape(null)
            } else if (e.key === 'Enter' && e.shiftKey === false) {
              e.preventDefault()
              labelInputRef.current?.focus()
            }
          }}
          onBlur={(e) => {
            // Only exit edit mode if clicking outside the card
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              // Check if the blur is not to the label input
              setTimeout(() => {
                if (document.activeElement !== labelInputRef.current) {
                  editor.setEditingShape(null)
                }
              }, 0)
            }
          }}
        />
        <input
          ref={labelInputRef}
          data-card-label
          type="text"
          value={label}
          onChange={handleLabelChange}
          placeholder="Label"
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '12px',
            outline: 'none',
            width: '100%',
            color: theme.text,
            marginTop: 'auto',
            cursor: isEditing ? 'text' : 'pointer',
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (!isEditing) {
              editor.setEditingShape(shape.id)
            }
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Escape') {
              editor.setEditingShape(null)
            } else if (e.key === 'Enter' && e.shiftKey === false) {
              e.preventDefault()
              editor.setEditingShape(null)
            }
          }}
          onBlur={(e) => {
            // Only exit edit mode if clicking outside the card
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setTimeout(() => {
                if (document.activeElement !== titleInputRef.current) {
                  editor.setEditingShape(null)
                }
              }, 0)
            }
          }}
        />
      </div>
    </HTMLContainer>
  )
}

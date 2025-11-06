import {
  ShapeUtil,
  Rectangle2d,
  HTMLContainer,
  getDefaultColorTheme,
  useEditor,
  type SvgExportContext,
} from '@tldraw/tldraw'
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

  return (
    <HTMLContainer>
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
        }}
      >
        <input
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
          }}
          onKeyDown={(e) => {
            // Prevent hotkeys from interfering when editing
            e.stopPropagation()
          }}
        />
        <input
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
          }}
          onKeyDown={(e) => {
            // Prevent hotkeys from interfering when editing
            e.stopPropagation()
          }}
        />
      </div>
    </HTMLContainer>
  )
}


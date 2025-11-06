import { StateNode, createShapeId, type TLPointerEventInfo } from '@tldraw/tldraw'

export class CardTool extends StateNode {
  static override id = 'card'
  static override initial = 'idle'

  override onEnter() {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onExit() {
    this.editor.setCursor({ type: 'default', rotation: 0 })
  }

  override onPointerDown(info: TLPointerEventInfo) {
    const { x, y } = info.point
    const shapeId = createShapeId()

    this.editor.createShape({
      id: shapeId,
      type: 'card',
      x,
      y,
      props: {
        w: 200,
        h: 150,
        title: '',
        label: '',
        fill: '#ffffff',
        stroke: '#000000',
      },
    })

    // Return to select tool after creating
    this.editor.setCurrentTool('select')
  }
}


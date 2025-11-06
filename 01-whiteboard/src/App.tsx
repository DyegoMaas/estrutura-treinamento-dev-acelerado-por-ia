import { Tldraw, type TLUiOverrides } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { CardShapeUtil } from './shapes/CardShapeUtil'
import { CardTool } from './tools/CardTool'

const overrides: TLUiOverrides = {
  tools(editor, tools) {
    tools.card = {
      id: 'card',
      icon: 'card',
      label: 'Card',
      kbd: 'n',
      onSelect: () => {
        editor.setCurrentTool('card')
      },
    }
    return tools
  },
}

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        persistenceKey="whiteboard-mvp"
        shapeUtils={[CardShapeUtil]}
        tools={[CardTool]}
        overrides={overrides}
      />
    </div>
  )
}

export default App


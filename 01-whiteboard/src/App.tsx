import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw persistenceKey="whiteboard-mvp" />
    </div>
  )
}

export default App


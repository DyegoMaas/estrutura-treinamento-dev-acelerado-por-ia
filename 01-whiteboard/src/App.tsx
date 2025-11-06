import { Tldraw, type TLUiOverrides, useEditor, useTools } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useEffect } from 'react'
import { CardShapeUtil } from './shapes/CardShapeUtil'
import { CardTool } from './tools/CardTool'
import { Minimap } from './components/Minimap'
import { MinimapToggle } from './components/MinimapToggle'
import { useMinimapState } from './components/useMinimapState'
import { ExportToggle } from './components/ExportToggle'

// Helper function to check if an input/textarea is focused (RF-14)
function isInputFocused(): boolean {
  const activeElement = document.activeElement
  if (!activeElement) return false
  
  const tagName = activeElement.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea'
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true'
  
  return isInput || isContentEditable
}

// Component to handle keyboard shortcuts (RF-2, RF-14)
function KeyboardShortcuts() {
  const editor = useEditor()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused (RF-14)
      if (isInputFocused()) {
        return
      }

      // Map hotkeys to tools (RF-2)
      switch (e.key.toLowerCase()) {
        case '1':
          e.preventDefault()
          editor.setCurrentTool('select')
          break
        case '2':
          e.preventDefault()
          editor.setCurrentTool('draw')
          break
        case '3':
          e.preventDefault()
          editor.setCurrentTool('arrow')
          break
        case 'n':
          e.preventDefault()
          editor.setCurrentTool('card')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor])

  return null
}

// Component to inject Card tool button into toolbar via DOM manipulation
function CardToolbarInjection() {
  const tools = useTools()
  const editor = useEditor()
  
  useEffect(() => {
    // Find the toolbar and tools group
    const toolbar = document.querySelector('[aria-label="Ferramentas"]')
    if (!toolbar) return
    
    // Find the div.tlui-row that contains the tool buttons
    const toolsGroup = toolbar.querySelector('div.tlui-row') as HTMLElement
    if (!toolsGroup) return
    
    // Check if Card button already exists
    if (toolsGroup.querySelector('[data-testid="tool-card"]')) return
    
    // Create Card button
    const cardButton = document.createElement('button')
    cardButton.type = 'button'
    cardButton.setAttribute('aria-label', 'Card — N')
    cardButton.setAttribute('data-testid', 'tool-card')
    cardButton.className = 'tlui-button tlui-button__tool'
    
    const isSelected = editor.getCurrentToolId() === 'card'
    if (isSelected) {
      cardButton.classList.add('tlui-button__tool--selected')
    }
    
    cardButton.onclick = () => {
      editor.setCurrentTool('card')
    }
    
    cardButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="8" stroke="currentColor" stroke-width="1.5" fill="none" rx="1"/>
        <line x1="4" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="1"/>
      </svg>
    `
    
    // Insert after Arrow tool (last button in group)
    toolsGroup.appendChild(cardButton)
    
    // Update selection state when tool changes
    const updateSelection = () => {
      const isSelected = editor.getCurrentToolId() === 'card'
      if (isSelected) {
        cardButton.classList.add('tlui-button__tool--selected')
      } else {
        cardButton.classList.remove('tlui-button__tool--selected')
      }
    }
    
    // Listen to tool changes using a different approach
    const interval = setInterval(updateSelection, 100)
    
    return () => {
      clearInterval(interval)
      cardButton.remove()
    }
  }, [editor, tools])
  
  return null
}

// Component to render Minimap and Toggle
function MinimapContainer() {
  const [visible] = useMinimapState()
  
  return (
    <>
      <MinimapToggle />
      <Minimap visible={visible} />
    </>
  )
}

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        persistenceKey="whiteboard-mvp"
        shapeUtils={[CardShapeUtil]}
        tools={[CardTool]}
        overrides={overrides}
      >
        <KeyboardShortcuts />
        <CardToolbarInjection />
        <MinimapContainer />
        <ExportToggle />
      </Tldraw>
    </div>
  )
}

const overrides: TLUiOverrides = {
  tools(editor, tools) {
    // Copy arrow tool structure as reference for Card tool
    const arrowTool = tools.arrow
    
    // Filter to show only Select, Draw, Arrow, Card, and Laser (RF-6, RF-8)
    const allowedTools = ['select', 'draw', 'arrow', 'card', 'laser']
    
    // Delete tools that are not allowed
    const toolIds = Object.keys(tools)
    for (const toolId of toolIds) {
      if (!allowedTools.includes(toolId)) {
        delete tools[toolId as keyof typeof tools]
      }
    }

    // Add Card tool with same structure as other tools
    tools.card = {
      id: 'card',
      icon: 'geo-rectangle',
      label: 'tools.card' as any,
      kbd: 'n',
      onSelect: () => {
        editor.setCurrentTool('card')
      },
      // Copy any additional properties from arrow tool if they exist
      ...(arrowTool && {
        readonlyOk: arrowTool.readonlyOk,
        shortcutsLabel: arrowTool.shortcutsLabel,
      }),
    }

    return tools
  },
  translations: {
    en: {
      'tools.card': 'Card',
    },
  },
}

export default App

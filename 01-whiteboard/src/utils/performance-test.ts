/**
 * Utility script to generate large boards for performance testing
 * Run in browser console to test with ~5k elements
 * 
 * Usage:
 * 1. Open app in browser
 * 2. Open console
 * 3. Paste this script and run
 * 4. Check performance and persistence
 */

export function generateLargeBoard(editor: any, count: number = 5000) {
  console.log(`Generating ${count} shapes for performance test...`)
  
  const startTime = performance.now()
  let created = 0
  
  // Create shapes in batches to avoid blocking
  const batchSize = 100
  const batches = Math.ceil(count / batchSize)
  
  function createBatch(batchIndex: number) {
    const batchStart = batchIndex * batchSize
    const batchEnd = Math.min(batchStart + batchSize, count)
    
    editor.batch(() => {
      for (let i = batchStart; i < batchEnd; i++) {
        const x = (i % 100) * 50
        const y = Math.floor(i / 100) * 50
        
        // Create different shape types to simulate real usage
        const shapeType = i % 4
        switch (shapeType) {
          case 0:
            // Draw shape
            editor.createShape({
              type: 'draw',
              x,
              y,
              props: {
                points: [
                  { x: 0, y: 0 },
                  { x: 50, y: 0 },
                  { x: 50, y: 50 },
                  { x: 0, y: 50 },
                ],
                color: 'black',
                fill: 'none',
                size: 'm',
              },
            })
            break
          case 1:
            // Arrow
            editor.createShape({
              type: 'arrow',
              x,
              y,
              props: {
                start: { x: 0, y: 0 },
                end: { x: 50, y: 50 },
                color: 'black',
              },
            })
            break
          case 2:
            // Rectangle
            editor.createShape({
              type: 'geo',
              x,
              y,
              props: {
                geo: 'rectangle',
                w: 50,
                h: 50,
                color: 'black',
                fill: 'none',
              },
            })
            break
          case 3:
            // Card
            editor.createShape({
              type: 'card',
              x,
              y,
              props: {
                w: 100,
                h: 80,
                title: `Card ${i}`,
                label: `Label ${i}`,
                fill: 'none',
                color: 'black',
              },
            })
            break
        }
        created++
      }
    })
    
    if (batchIndex < batches - 1) {
      // Schedule next batch
      setTimeout(() => createBatch(batchIndex + 1), 10)
    } else {
      const endTime = performance.now()
      console.log(`Created ${created} shapes in ${(endTime - startTime).toFixed(2)}ms`)
      console.log(`Average: ${((endTime - startTime) / created).toFixed(2)}ms per shape`)
      
      // Test persistence
      console.log('Testing persistence...')
      const snapshot = editor.store.getSnapshot()
      const snapshotSize = JSON.stringify(snapshot).length
      console.log(`Snapshot size: ${(snapshotSize / 1024).toFixed(2)} KB`)
      
      // Test reload
      console.log('You can now reload the page to test persistence')
    }
  }
  
  createBatch(0)
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).generateLargeBoard = generateLargeBoard
}


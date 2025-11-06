import { describe, it, expect } from 'vitest'
import { createShapeId } from '@tldraw/tldraw'
import { CardShapeUtil } from './CardShapeUtil'
import type { CardShape } from '../types/card'

// Mock editor for testing
const mockEditor = {
  updateShapes: () => {},
  getCurrentPageId: () => createShapeId(),
} as any

describe('CardShapeUtil', () => {
  const util = new CardShapeUtil(mockEditor)

  describe('static type', () => {
    it('should have type "card"', () => {
      expect(CardShapeUtil.type).toBe('card')
    })
  })

  describe('getDefaultProps', () => {
    it('should return default props with w, h, title, and label', () => {
      const defaults = util.getDefaultProps()

      expect(defaults).toEqual({
        w: 200,
        h: 150,
        title: '',
        label: '',
        fill: '#ffffff',
        stroke: '#000000',
      })
    })
  })

  describe('getGeometry', () => {
    it('should return Rectangle2d geometry with correct dimensions', () => {
      const shape: CardShape = {
        id: createShapeId(),
        type: 'card',
        typeName: 'shape',
        x: 0,
        y: 0,
        rotation: 0,
        index: 'a1' as any,
        parentId: createShapeId(),
        isLocked: false,
        opacity: 1,
        meta: {},
        props: {
          w: 200,
          h: 150,
          title: 'Test',
          label: 'Label',
        },
      }

      const geometry = util.getGeometry(shape)
      expect(geometry).toBeDefined()
      const bounds = geometry.getBounds()
      expect(bounds.width).toBe(200)
      expect(bounds.height).toBe(150)
    })
  })

  describe('canEdit', () => {
    it('should return true to allow inline editing', () => {
      expect(util.canEdit()).toBe(true)
    })
  })

  describe('component', () => {
    it('should return a component function', () => {
      const shape: CardShape = {
        id: createShapeId(),
        type: 'card',
        typeName: 'shape',
        x: 0,
        y: 0,
        rotation: 0,
        index: 'a1' as any,
        parentId: createShapeId(),
        isLocked: false,
        opacity: 1,
        meta: {},
        props: {
          w: 200,
          h: 150,
          title: 'Test Title',
          label: 'Test Label',
        },
      }

      const Component = util.component(shape)
      expect(Component).toBeDefined()
      expect(typeof Component).toBe('object')
      // Component is a JSX element, not a function component
      expect(Component.type).toBeDefined()
    })
  })

  describe('toSvg', () => {
    it('should return SVG element with card appearance', () => {
      const shape: CardShape = {
        id: createShapeId(),
        type: 'card',
        typeName: 'shape',
        x: 0,
        y: 0,
        rotation: 0,
        index: 'a1' as any,
        parentId: createShapeId(),
        isLocked: false,
        opacity: 1,
        meta: {},
        props: {
          w: 200,
          h: 150,
          title: 'Test Title',
          label: 'Test Label',
          fill: '#ffffff',
          stroke: '#000000',
        },
      }

      const svg = util.toSvg(shape, {
        bounds: { x: 0, y: 0, w: 200, h: 150 },
        scale: 1,
        background: false,
      } as any)

      expect(svg).toBeDefined()
      expect(svg.type).toBe('g')
      expect(svg.props.children).toBeDefined()
    })
  })

  describe('indicator', () => {
    it('should return rect indicator', () => {
      const shape: CardShape = {
        id: createShapeId(),
        type: 'card',
        typeName: 'shape',
        x: 0,
        y: 0,
        rotation: 0,
        index: 'a1' as any,
        parentId: createShapeId(),
        isLocked: false,
        opacity: 1,
        meta: {},
        props: {
          w: 200,
          h: 150,
          title: 'Test',
          label: 'Label',
        },
      }

      const indicator = util.indicator(shape)
      expect(indicator).toBeDefined()
      expect(indicator.type).toBe('rect')
      expect(indicator.props.width).toBe(200)
      expect(indicator.props.height).toBe(150)
    })
  })
})


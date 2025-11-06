import type { TLBaseShape } from '@tldraw/tldraw'

export type CardShapeType = 'card'

export interface CardShapeProps {
  w: number
  h: number
  title: string
  label: string
  fill?: string
  stroke?: string
}

export type CardShape = TLBaseShape<CardShapeType, CardShapeProps>


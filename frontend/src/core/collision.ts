import type { Pos } from './types'
import { isInBounds } from './board'

/** Fal- vagy önütközés (FK4). */
export function hitWall(pos: Pos, rows: number, cols: number): boolean {
  return !isInBounds(pos, rows, cols)
}

export function hitSelf(head: Pos, body: Pos[]): boolean {
  for (let i = 1; i < body.length; i++) {
    const [hx, hy] = head
    const [bx, by] = body[i]
    if (hx === bx && hy === by) return true
  }
  return false
}

export function hitFood(head: Pos, food: Pos | null): boolean {
  if (!food) return false
  return head[0] === food[0] && head[1] === food[1]
}

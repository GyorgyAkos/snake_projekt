import type { Pos } from './types'
import { getEmptyCells } from './board'
import type { GridCell } from './types'

/** Üres cellák közül véletlenszerű pozíció (FK3 – legfeljebb 1 étel, üres cellába). */
export function placeFood(
  grid: GridCell[][],
  rows: number,
  cols: number,
  snakeBody: Pos[]
): Pos | null {
  const empty = getEmptyCells(grid, rows, cols)
  for (const p of snakeBody) {
    const idx = empty.findIndex(([x, y]) => p[0] === x && p[1] === y)
    if (idx >= 0) empty.splice(idx, 1)
  }
  if (empty.length === 0) return null
  const i = Math.floor(Math.random() * empty.length)
  return empty[i] ?? null
}

/** Seed-elhető véletlen választás (rng modul). */
export function placeFoodSeeded(
  rows: number,
  cols: number,
  snakeBody: Pos[],
  nextRandom: () => number
): Pos | null {
  const empty: Pos[] = []
  const bodySet = new Set(snakeBody.map(([x, y]) => `${x},${y}`))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!bodySet.has(`${c},${r}`)) empty.push([c, r])
    }
  }
  if (empty.length === 0) return null
  const i = Math.floor(nextRandom() * empty.length)
  return empty[i] ?? null
}

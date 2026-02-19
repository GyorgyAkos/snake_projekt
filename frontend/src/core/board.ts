import type { GridCell, Pos } from './types'

/** N×M rács (spec 7.5.2, FK1). Fal = 1, üres = 0. */
export function createBoard(rows: number, cols: number): GridCell[][] {
  const grid: GridCell[][] = []
  for (let r = 0; r < rows; r++) {
    grid[r] = []
    for (let c = 0; c < cols; c++) {
      grid[r][c] = 0
    }
  }
  return grid
}

/** Rács belseje: (0,0)..(cols-1, rows-1) – fal nincs a spec szerint, csak határ. */
export function isInBounds(pos: Pos, rows: number, cols: number): boolean {
  const [x, y] = pos
  return x >= 0 && x < cols && y >= 0 && y < rows
}

/** Üres cellák listája (étel generáláshoz, FK3). */
export function getEmptyCells(
  grid: GridCell[][],
  rows: number,
  cols: number
): Pos[] {
  const out: Pos[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) out.push([c, r])
    }
  }
  return out
}

import type { Direction, Pos } from './types'

/** Kezdőhossz 3, középen, jobbra (spec 7.2). */
export function createSnake(rows: number, cols: number): { body: Pos[]; direction: Direction } {
  const cy = Math.floor(rows / 2)
  const cx = Math.floor(cols / 2)
  const body: Pos[] = [
    [cx, cy],
    [cx - 1, cy],
    [cx - 2, cy],
  ]
  return { body, direction: 'Right' }
}

/** Következő fej pozíció (FK2 – egy cella az irányba). */
export function getNextHead(head: Pos, direction: Direction): Pos {
  const [x, y] = head
  switch (direction) {
    case 'Up': return [x, y - 1]
    case 'Down': return [x, y + 1]
    case 'Left': return [x - 1, y]
    case 'Right': return [x + 1, y]
  }
}

/** Ellentétes irány tiltása (spec 7.2). */
export function isOpposite(dir: Direction, other: Direction): boolean {
  return (
    (dir === 'Up' && other === 'Down') ||
    (dir === 'Down' && other === 'Up') ||
    (dir === 'Left' && other === 'Right') ||
    (dir === 'Right' && other === 'Left')
  )
}

/** Lépés: új fej elé, ha nem étel, farok le (FK2, FK5). */
export function moveSnake(
  body: Pos[],
  direction: Direction,
  grow: boolean
): Pos[] {
  const head = body[0]
  const next = getNextHead(head, direction)
  const nextBody = [next, ...body]
  if (!grow) nextBody.pop()
  return nextBody
}

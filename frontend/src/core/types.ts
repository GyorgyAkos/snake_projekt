/** Irány (spec 7.5.3) – nem fordulhat 180° (FK2). */
export type Direction = 'Up' | 'Right' | 'Down' | 'Left'

/** Rácscella típusa: 0=üres, 1=fal, 2=kígyó, 3=étel (spec 3.1). */
export type GridCell = 0 | 1 | 2 | 3

/** Pozíció [x, y] vagy { x, y }. */
export type Pos = [number, number]

/** Játékállapot pillanatkép – MI és mentéshez (spec 7.5.3). */
export interface GameStateSnapshot {
  snake: Pos[]
  direction: Direction
  food: Pos | null
  seed: number
  tick: number
  score: number
  rows: number
  cols: number
}

/** Játék állapotgép (spec 7.5.2). */
export type GamePhase = 'INIT' | 'RUNNING' | 'PAUSED' | 'GAME_OVER'

/** MI lépés (akció). */
export type Action = Direction

/** Stratégia interfész (spec 7.18). */
export interface Strategy {
  nextMove(state: GameStateSnapshot): Action
}

/** Konfiguráció (spec 7.10, 7.18). */
export interface GameConfig {
  grid: { rows: number; cols: number }
  tick_ms: number
  seed: number | null
  ai?: { strategy: string; safety: boolean }
}

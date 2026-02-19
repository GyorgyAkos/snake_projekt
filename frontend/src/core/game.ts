import type { Direction, GameConfig, GamePhase, GameStateSnapshot, Pos } from './types'
import { createBoard, isInBounds } from './board'
import { createSnake, getNextHead, isOpposite, moveSnake } from './snake'
import { placeFoodSeeded } from './food'
import { hitSelf, hitWall, hitFood } from './collision'
import { addScore } from './score'
import { setSeed, next } from './rng'

export interface GameState {
  phase: GamePhase
  rows: number
  cols: number
  snakeBody: Pos[]
  direction: Direction
  food: Pos | null
  score: number
  tick: number
  seed: number
  tickMs: number
}

const DEFAULT_ROWS = 20
const DEFAULT_COLS = 20
const DEFAULT_TICK_MS = 120

export function createGame(config: Partial<GameConfig> | null): GameState {
  const rows = config?.grid?.rows ?? DEFAULT_ROWS
  const cols = config?.grid?.cols ?? DEFAULT_COLS
  const tickMs = config?.tick_ms ?? DEFAULT_TICK_MS
  const seed = config?.seed ?? Date.now()
  setSeed(seed)
  const { body, direction } = createSnake(rows, cols)
  const food = placeFoodSeeded(rows, cols, body, next)
  return {
    phase: 'INIT',
    rows,
    cols,
    snakeBody: body,
    direction,
    food,
    score: 0,
    tick: 0,
    seed,
    tickMs,
  }
}

export function setDirection(state: GameState, newDir: Direction): GameState {
  if (state.phase !== 'RUNNING' && state.phase !== 'INIT') return state
  if (isOpposite(state.direction, newDir)) return state
  return { ...state, direction: newDir }
}

export function startGame(state: GameState): GameState {
  if (state.phase === 'INIT' || state.phase === 'PAUSED') {
    return { ...state, phase: 'RUNNING' }
  }
  return state
}

export function pauseGame(state: GameState): GameState {
  if (state.phase === 'RUNNING') return { ...state, phase: 'PAUSED' }
  return state
}

export function resumeGame(state: GameState): GameState {
  if (state.phase === 'PAUSED') return { ...state, phase: 'RUNNING' }
  return state
}

export function tick(state: GameState): GameState {
  if (state.phase !== 'RUNNING') return state
  const head = state.snakeBody[0]
  const nextHead = getNextHead(head, state.direction)
  if (hitWall(nextHead, state.rows, state.cols)) {
    return { ...state, phase: 'GAME_OVER' }
  }
  const ate = hitFood(nextHead, state.food)
  const nextBody = moveSnake(state.snakeBody, state.direction, ate)
  if (hitSelf(nextHead, nextBody)) {
    return { ...state, phase: 'GAME_OVER' }
  }
  let food = state.food
  let score = state.score
  if (ate) {
    score = addScore(score)
    setSeed(state.seed + state.tick)
    food = placeFoodSeeded(state.rows, state.cols, nextBody, next)
  }
  return {
    ...state,
    snakeBody: nextBody,
    food,
    score,
    tick: state.tick + 1,
  }
}

export function getSnapshot(state: GameState): GameStateSnapshot {
  return {
    snake: state.snakeBody.map((p) => [...p]),
    direction: state.direction,
    food: state.food ? [...state.food] : null,
    seed: state.seed,
    tick: state.tick,
    score: state.score,
    rows: state.rows,
    cols: state.cols,
  }
}

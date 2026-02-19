import type { Strategy as IStrategy, GameStateSnapshot, Action } from '../core/types'

/** Placeholder: később BFS/A* / Hamilton / RL. */
export const placeholderStrategy: IStrategy = {
  nextMove(state: GameStateSnapshot): Action {
    const [hx, hy] = state.snake[0]
    const dir = state.direction
    if (!state.food) return dir
    const [fx, fy] = state.food
    if (fx > hx) return 'Right'
    if (fx < hx) return 'Left'
    if (fy < hy) return 'Up'
    if (fy > hy) return 'Down'
    return dir
  },
}

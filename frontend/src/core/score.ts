/** Alap: 1 pont/étel; nehézségen szorzó (FK6). */
export const SCORE_PER_FOOD = 1

export function addScore(current: number, difficultyMultiplier = 1): number {
  return current + SCORE_PER_FOOD * difficultyMultiplier
}

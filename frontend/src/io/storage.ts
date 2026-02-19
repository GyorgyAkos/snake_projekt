const SCORES_KEY = 'snake_scores'

export interface StoredScore {
  score: number
  tick: number
  length: number
  date: string
  mode: 'player' | 'ai'
}

export function loadScores(): StoredScore[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveScore(entry: StoredScore): void {
  const list = loadScores()
  list.unshift(entry)
  const kept = list.slice(0, 100)
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(kept))
  } catch {
    // ignore
  }
}

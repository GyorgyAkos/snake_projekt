import type { GameConfig } from '../core/types'

const DEFAULT_CONFIG: GameConfig = {
  grid: { rows: 20, cols: 20 },
  tick_ms: 120,
  seed: null,
  ai: { strategy: 'astar', safety: true },
}

const STORAGE_KEY = 'snake_config'

export function loadConfig(): GameConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    const parsed = JSON.parse(raw) as Partial<GameConfig>
    return {
      grid: { ...DEFAULT_CONFIG.grid, ...parsed.grid },
      tick_ms: parsed.tick_ms ?? DEFAULT_CONFIG.tick_ms,
      seed: parsed.seed ?? DEFAULT_CONFIG.seed,
      ai: { ...DEFAULT_CONFIG.ai, ...parsed.ai },
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveConfig(config: GameConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

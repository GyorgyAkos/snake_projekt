import { useState } from 'react'
import type { GameConfig } from '../core/types'
import { AI_STRATEGIES, type AIStrategyId } from '../ai/strategies'

const validStrategyIds = new Set<string>(AI_STRATEGIES.map((s) => s.id))

interface AISettingsProps {
  config: GameConfig
  onSave: (config: GameConfig) => void
  onStartGame: (config: GameConfig) => void
  onBack?: () => void
  /** Ha true, nem jelenik meg a kártya keret és a Vissza gomb (fülben beágyazva). */
  embedInTabs?: boolean
}

export function AISettings({ config, onSave, onStartGame, onBack, embedInTabs }: AISettingsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(config.ai?.strategy ?? 'astar')
  const selectedInfo = AI_STRATEGIES.find((s) => s.id === selectedStrategy)

  const handleStart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const rows = Number((form.elements.namedItem('rows') as HTMLInputElement).value)
    const cols = Number((form.elements.namedItem('cols') as HTMLInputElement).value)
    const tickMs = Number((form.elements.namedItem('tick_ms') as HTMLInputElement).value)
    const seedRaw = (form.elements.namedItem('seed') as HTMLInputElement).value
    const strategy = validStrategyIds.has(selectedStrategy) ? (selectedStrategy as AIStrategyId) : 'astar'
    const c: GameConfig = {
      ...config,
      grid: { rows: Math.max(10, Math.min(40, rows)), cols: Math.max(10, Math.min(40, cols)) },
      tick_ms: Math.max(50, Math.min(500, tickMs)),
      seed: seedRaw === '' ? null : Number(seedRaw) || null,
      ai: { strategy, safety: config.ai?.safety ?? true },
    }
    onSave(c)
    onStartGame(c)
  }

  const formContent = (
    <form onSubmit={handleStart}>
      <div className="form-group">
        <label>Sorok</label>
        <input name="rows" type="number" min={10} max={40} defaultValue={config.grid.rows} />
      </div>
      <div className="form-group">
        <label>Oszlopok</label>
        <input name="cols" type="number" min={10} max={40} defaultValue={config.grid.cols} />
      </div>
      <div className="form-group">
        <label>Tick (ms)</label>
        <input name="tick_ms" type="number" min={50} max={500} defaultValue={config.tick_ms} />
      </div>
      <div className="form-group">
        <label>Seed (üres = véletlen)</label>
        <input name="seed" type="text" placeholder="pl. 42" defaultValue={config.seed ?? ''} />
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label htmlFor="ai-strategy-select">MI stratégia</label>
        <select
          id="ai-strategy-select"
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="form-select"
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: '1rem',
          }}
        >
          {AI_STRATEGIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {selectedInfo && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
            {selectedInfo.description}
          </p>
        )}
      </div>
      <div className="btn-group" style={{ marginTop: '1rem' }}>
        <button type="submit" className="btn">Játék indítása</button>
        {!embedInTabs && onBack && (
          <button type="button" className="btn btn-secondary" onClick={onBack}>Vissza</button>
        )}
      </div>
    </form>
  )

  if (embedInTabs) return <div className="tab-panel">{formContent}</div>
  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2 className="card-title">MI mód</h2>
      <p className="card-subtitle" style={{ marginTop: 0 }}>Beállítások</p>
      {formContent}
    </div>
  )
}

import { useState } from 'react'
import type { GameConfig } from '../core/types'
import { AI_STRATEGIES } from '../ai/strategies'

interface SettingsProps {
  config: GameConfig
  onSave: (config: GameConfig) => void
  onBack: () => void
}

const validStrategyIds = new Set(AI_STRATEGIES.map((s) => s.id))

export function Settings({ config, onSave, onBack }: SettingsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(config.ai?.strategy ?? 'astar')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const rows = Number((form.elements.namedItem('rows') as HTMLInputElement).value)
    const cols = Number((form.elements.namedItem('cols') as HTMLInputElement).value)
    const tickMs = Number((form.elements.namedItem('tick_ms') as HTMLInputElement).value)
    const seedRaw = (form.elements.namedItem('seed') as HTMLInputElement).value
    const strategy = validStrategyIds.has(selectedStrategy) ? selectedStrategy : 'astar'
    onSave({
      ...config,
      grid: { rows: Math.max(10, Math.min(40, rows)), cols: Math.max(10, Math.min(40, cols)) },
      tick_ms: Math.max(50, Math.min(500, tickMs)),
      seed: seedRaw === '' ? null : Number(seedRaw) || null,
      ai: { ...config.ai, strategy },
    })
    onBack()
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2 className="card-subtitle">Beállítások</h2>
      <form onSubmit={handleSubmit}>
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

        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>MI stratégia (backend)</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Az MI módban a kígyót a választott stratégia vezérli. Mindegyik más módon dönt a következő lépésről.
          </p>
          <div className="strategy-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {AI_STRATEGIES.map((s) => (
              <label
                key={s.id}
                style={{
                  display: 'block',
                  padding: '0.75rem',
                  background: 'var(--bg-subtle)',
                  border: `2px solid ${selectedStrategy === s.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="ai_strategy"
                  value={s.id}
                  checked={selectedStrategy === s.id}
                  onChange={() => setSelectedStrategy(s.id)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>{s.name}</strong>
                <p style={{ margin: '0.35rem 0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {s.description}
                </p>
              </label>
            ))}
          </div>
        </div>

        <div className="btn-group" style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn">Mentés</button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>Vissza</button>
        </div>
      </form>
    </div>
  )
}

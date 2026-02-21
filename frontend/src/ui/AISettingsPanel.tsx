import { useState, useEffect } from 'react'
import type { GameConfig } from '../core/types'
import { AI_STRATEGIES, type AIStrategyId } from '../ai/strategies'

const validStrategyIds = new Set<string>(AI_STRATEGIES.map((s) => s.id))

interface AISettingsPanelProps {
  config: GameConfig
  onSave: (config: GameConfig) => void
  onApply?: (config: GameConfig) => void
  canApply?: boolean
}

export function AISettingsPanel({ config, onSave, onApply, canApply }: AISettingsPanelProps) {
  const [rows, setRows] = useState(String(config.grid.rows))
  const [cols, setCols] = useState(String(config.grid.cols))
  const [tickMs, setTickMs] = useState(String(config.tick_ms))
  const [seed, setSeed] = useState(config.seed == null ? '' : String(config.seed))
  const [selectedStrategy, setSelectedStrategy] = useState<string>(config.ai?.strategy ?? 'astar')

  useEffect(() => {
    setRows(String(config.grid.rows))
    setCols(String(config.grid.cols))
    setTickMs(String(config.tick_ms))
    setSeed(config.seed == null ? '' : String(config.seed))
    setSelectedStrategy(config.ai?.strategy ?? 'astar')
  }, [config.grid.rows, config.grid.cols, config.tick_ms, config.seed, config.ai?.strategy])

  const buildConfig = (): GameConfig => ({
    ...config,
    grid: {
      rows: Math.max(10, Math.min(40, Number(rows) || 20)),
      cols: Math.max(10, Math.min(40, Number(cols) || 20)),
    },
    tick_ms: Math.max(50, Math.min(500, Number(tickMs) || 120)),
    seed: seed === '' ? null : Number(seed) || null,
    ai: {
      strategy: validStrategyIds.has(selectedStrategy) ? (selectedStrategy as AIStrategyId) : 'astar',
      safety: config.ai?.safety ?? true,
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const c = buildConfig()
    onSave(c)
    if (canApply && onApply) onApply(c)
  }

  return (
    <div className="settings-sidebar">
      <h2 className="card-subtitle">MI mód – Beállítások</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Sorok</label>
          <input
            type="number"
            min={10}
            max={40}
            value={rows}
            onChange={(e) => setRows(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Oszlopok</label>
          <input
            type="number"
            min={10}
            max={40}
            value={cols}
            onChange={(e) => setCols(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Tick (ms)</label>
          <input
            type="number"
            min={50}
            max={500}
            value={tickMs}
            onChange={(e) => setTickMs(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Seed (üres = véletlen)</label>
          <input
            type="text"
            placeholder="pl. 42"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>MI stratégia</label>
          <div className="strategy-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {AI_STRATEGIES.map((s) => (
              <label
                key={s.id}
                style={{
                  display: 'block',
                  padding: '0.5rem',
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
                <p style={{ margin: '0.25rem 0 0 1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {s.description}
                </p>
              </label>
            ))}
          </div>
        </div>
        <div className="btn-group" style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn btn-block">
            Mentés
          </button>
        </div>
      </form>
    </div>
  )
}

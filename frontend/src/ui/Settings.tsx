import type { GameConfig } from '../core/types'

interface SettingsProps {
  config: GameConfig
  onSave: (config: GameConfig) => void
  onBack: () => void
}

export function Settings({ config, onSave, onBack }: SettingsProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const rows = Number((form.elements.namedItem('rows') as HTMLInputElement).value)
    const cols = Number((form.elements.namedItem('cols') as HTMLInputElement).value)
    const tickMs = Number((form.elements.namedItem('tick_ms') as HTMLInputElement).value)
    const seedRaw = (form.elements.namedItem('seed') as HTMLInputElement).value
    const strategy = (form.elements.namedItem('ai_strategy') as HTMLSelectElement)?.value || 'astar'
    onSave({
      ...config,
      grid: { rows: Math.max(10, Math.min(40, rows)), cols: Math.max(10, Math.min(40, cols)) },
      tick_ms: Math.max(50, Math.min(500, tickMs)),
      seed: seedRaw === '' ? null : Number(seedRaw) || null,
      ai: { ...config.ai, strategy: strategy === 'hamilton' ? 'hamilton' : 'astar' },
    })
    onBack()
  }

  return (
    <div className="card">
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
        <div className="form-group">
          <label>MI stratégia (backend)</label>
          <select name="ai_strategy" defaultValue={config.ai?.strategy ?? 'astar'} style={{ maxWidth: 140, padding: '0.5rem 0.75rem', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <option value="astar">A*</option>
            <option value="hamilton">Hamilton</option>
          </select>
        </div>
        <div className="btn-group">
          <button type="submit" className="btn">Mentés</button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>Vissza</button>
        </div>
      </form>
    </div>
  )
}

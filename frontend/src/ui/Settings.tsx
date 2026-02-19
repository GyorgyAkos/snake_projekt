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
    onSave({
      ...config,
      grid: { rows: Math.max(10, Math.min(40, rows)), cols: Math.max(10, Math.min(40, cols)) },
      tick_ms: Math.max(50, Math.min(500, tickMs)),
      seed: seedRaw === '' ? null : Number(seedRaw) || null,
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
        <div className="btn-group">
          <button type="submit" className="btn">Mentés</button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>Vissza</button>
        </div>
      </form>
    </div>
  )
}

import { useState, useEffect } from 'react'
import type { GameConfig } from '../core/types'

interface PlayerSettingsPanelProps {
  config: GameConfig
  onSave: (config: GameConfig) => void
  onApply?: (config: GameConfig) => void
  canApply?: boolean
}

export function PlayerSettingsPanel({ config, onSave, onApply, canApply }: PlayerSettingsPanelProps) {
  const [rows, setRows] = useState(String(config.grid.rows))
  const [cols, setCols] = useState(String(config.grid.cols))
  const [tickMs, setTickMs] = useState(String(config.tick_ms))
  const [seed, setSeed] = useState(config.seed == null ? '' : String(config.seed))

  useEffect(() => {
    setRows(String(config.grid.rows))
    setCols(String(config.grid.cols))
    setTickMs(String(config.tick_ms))
    setSeed(config.seed == null ? '' : String(config.seed))
  }, [config.grid.rows, config.grid.cols, config.tick_ms, config.seed])

  const buildConfig = (): GameConfig => ({
    ...config,
    grid: {
      rows: Math.max(10, Math.min(40, Number(rows) || 20)),
      cols: Math.max(10, Math.min(40, Number(cols) || 20)),
    },
    tick_ms: Math.max(50, Math.min(500, Number(tickMs) || 120)),
    seed: seed === '' ? null : Number(seed) || null,
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const c = buildConfig()
    onSave(c)
    if (canApply && onApply) onApply(c)
  }

  return (
    <div className="settings-sidebar">
      <h2 className="card-subtitle">Játékos mód – Beállítások</h2>
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
        <div className="btn-group" style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn btn-block">
            Mentés
          </button>
        </div>
      </form>
    </div>
  )
}

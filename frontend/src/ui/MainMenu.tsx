import { useState } from 'react'
import type { GameConfig } from '../core/types'

interface MainMenuProps {
  config: GameConfig
  onStartGame: (config: GameConfig, mode: 'player' | 'ai') => void
  onOpenSettings: () => void
  onResults: () => void
  onProfile?: () => void
  isLoggedIn?: boolean
}

export function MainMenu({
  config,
  onStartGame,
  onOpenSettings,
  onResults,
  onProfile,
  isLoggedIn,
}: MainMenuProps) {
  const [mode, setMode] = useState<'player' | 'ai'>('player')

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2 className="card-title">Snake – MI</h2>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label>Játék mód</label>
        <div className="mode-switch" role="group" aria-label="Játék mód választása">
          <label className="mode-option">
            <input
              type="radio"
              name="gameMode"
              value="player"
              checked={mode === 'player'}
              onChange={() => setMode('player')}
            />
            <span>Játékos</span>
          </label>
          <label className="mode-option">
            <input
              type="radio"
              name="gameMode"
              value="ai"
              checked={mode === 'ai'}
              onChange={() => setMode('ai')}
            />
            <span>MI</span>
          </label>
        </div>
      </div>

      <menu style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <li>
          <button type="button" className="btn btn-block" onClick={() => onStartGame(config, mode)}>
            Játék indítása
          </button>
        </li>
        <li>
          <button type="button" className="btn btn-block btn-secondary" onClick={onOpenSettings}>
            Beállítások
          </button>
        </li>
        <li>
          <button type="button" className="btn btn-block btn-secondary" onClick={onResults}>
            Eredmények
          </button>
        </li>
        {isLoggedIn && onProfile && (
          <li>
            <button type="button" className="btn btn-block btn-secondary" onClick={onProfile}>
              Profil
            </button>
          </li>
        )}
      </menu>
    </div>
  )
}

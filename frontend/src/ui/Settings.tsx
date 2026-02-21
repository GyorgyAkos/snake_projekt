import { useState } from 'react'
import type { GameConfig } from '../core/types'
import { PlayerSettings } from './PlayerSettings'
import { AISettings } from './AISettings'

type Tab = 'player' | 'ai'

interface SettingsProps {
  config: GameConfig
  onSave: (config: GameConfig) => void
  onStartPlayer: (config: GameConfig) => void
  onStartAI: (config: GameConfig) => void
  onBack: () => void
}

export function Settings({ config, onSave, onStartPlayer, onStartAI, onBack }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('player')

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2 className="card-title">Beállítások</h2>
      <div className="menu-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'player'}
          className={activeTab === 'player' ? 'btn active' : 'btn'}
          onClick={() => setActiveTab('player')}
        >
          Játékos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ai'}
          className={activeTab === 'ai' ? 'btn active' : 'btn'}
          onClick={() => setActiveTab('ai')}
        >
          MI
        </button>
      </div>
      <div role="tabpanel">
        {activeTab === 'player' && (
          <PlayerSettings
            config={config}
            onSave={onSave}
            onStartGame={onStartPlayer}
            embedInTabs
          />
        )}
        {activeTab === 'ai' && (
          <AISettings
            config={config}
            onSave={onSave}
            onStartGame={onStartAI}
            embedInTabs
          />
        )}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary btn-block" onClick={onBack}>
          Vissza a főmenübe
        </button>
      </div>
    </div>
  )
}

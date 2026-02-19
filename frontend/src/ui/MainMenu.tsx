interface MainMenuProps {
  onStartPlayer: () => void
  onStartAI: () => void
  onSettings: () => void
  onResults: () => void
}

export function MainMenu({ onStartPlayer, onStartAI, onSettings, onResults }: MainMenuProps) {
  return (
    <div className="card">
      <h2 className="card-title">Snake – MI</h2>
      <menu style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <li>
          <button type="button" className="btn btn-block" onClick={onStartPlayer}>
            Játékos mód
          </button>
        </li>
        <li>
          <button type="button" className="btn btn-block btn-secondary" onClick={onStartAI}>
            MI mód
          </button>
        </li>
        <li>
          <button type="button" className="btn btn-block btn-secondary" onClick={onSettings}>
            Beállítások
          </button>
        </li>
        <li>
          <button type="button" className="btn btn-block btn-secondary" onClick={onResults}>
            Eredmények
          </button>
        </li>
      </menu>
    </div>
  )
}

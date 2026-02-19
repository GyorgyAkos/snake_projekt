import type { StoredScore } from '../io/storage'

interface ResultsProps {
  scores: StoredScore[]
  onBack: () => void
}

export function Results({ scores, onBack }: ResultsProps) {
  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2 className="card-subtitle">Eredmények</h2>
      {scores.length === 0 ? (
        <p className="empty-state">Még nincs mentett eredmény.</p>
      ) : (
        <ul className="results-list">
          {scores.slice(0, 20).map((s, i) => (
            <li key={i}>
              <strong>{s.score}</strong> pont · {s.tick} lépés · hossz {s.length} · {s.mode === 'player' ? 'Játékos' : 'MI'} · {new Date(s.date).toLocaleString('hu-HU')}
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn-secondary" onClick={onBack}>
        Vissza
      </button>
    </div>
  )
}

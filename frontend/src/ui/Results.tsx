import { useAuth } from '../AuthContext'
import type { StoredScore } from '../io/storage'

function modeLabel(mode: string, aiStrategy?: string | null): string {
  if (mode === 'player') return 'Játékos'
  if (mode === 'ai' && aiStrategy) return aiStrategy === 'hamilton' ? 'MI (Hamilton)' : 'MI (A*)'
  return 'MI'
}

interface ResultsProps {
  scores: StoredScore[]
  onBack: () => void
}

export function Results({ scores, onBack }: ResultsProps) {
  const { user } = useAuth()

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2 className="card-subtitle">Eredmények</h2>
      {user && (
        <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Felhasználó: <strong>{user.username}</strong>
        </p>
      )}
      {scores.length === 0 ? (
        <p className="empty-state">Még nincs mentett eredmény.</p>
      ) : (
        <ul className="results-list">
          {scores.slice(0, 20).map((s, i) => (
            <li key={i}>
              <strong>{s.score}</strong> pont · {s.tick} lépés · hossz {s.length} · <strong>{modeLabel(s.mode, s.aiStrategy)}</strong> · {new Date(s.date).toLocaleString('hu-HU')}
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

import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { fetchScores, updateUsername, updatePassword } from '../api'
import type { ScoreEntry } from '../api'
import { getStrategyName } from '../ai/strategies'

const modeLabel = (mode: string, aiStrategy: string | null) => {
  if (mode === 'player') return 'Játékos'
  if (mode === 'ai' && aiStrategy) return `MI (${getStrategyName(aiStrategy)})`
  return 'MI'
}

export function Profile({ onBack }: { onBack: () => void }) {
  const { user, loadUser } = useAuth()
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [usernameEdit, setUsernameEdit] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (!user) return
    setUsernameEdit(user.username)
  }, [user])

  useEffect(() => {
    let cancelled = false
    fetchScores()
      .then(({ scores: s }) => { if (!cancelled) setScores(s) })
      .catch(() => { if (!cancelled) setScores([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError('')
    if (!usernameEdit.trim()) return
    setUsernameSaving(true)
    try {
      await updateUsername(usernameEdit.trim())
      await loadUser()
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'Hiba')
    } finally {
      setUsernameSaving(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError('Minden mező kitöltése kötelező.')
      return
    }
    if (pwNew.length < 6) {
      setPwError('Az új jelszó legalább 6 karakter legyen.')
      return
    }
    if (pwNew !== pwConfirm) {
      setPwError('A két új jelszó nem egyezik.')
      return
    }
    setPwSaving(true)
    try {
      await updatePassword(pwCurrent, pwNew, pwConfirm)
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Hiba')
    } finally {
      setPwSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2 className="card-subtitle">Profil</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>{user.email} · {user.username}</p>

      <form onSubmit={handleSaveUsername} style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Felhasználónév módosítása</label>
          <input value={usernameEdit} onChange={(e) => setUsernameEdit(e.target.value)} style={{ maxWidth: '100%' }} />
        </div>
        {usernameError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{usernameError}</p>}
        <button type="submit" className="btn btn-secondary" disabled={usernameSaving}>{usernameSaving ? '...' : 'Mentés'}</button>
      </form>

      <form onSubmit={handleSavePassword} style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Jelenlegi jelszó</label>
          <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} style={{ maxWidth: '100%' }} />
        </div>
        <div className="form-group">
          <label>Új jelszó</label>
          <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} style={{ maxWidth: '100%' }} />
        </div>
        <div className="form-group">
          <label>Új jelszó ismétlése</label>
          <input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} style={{ maxWidth: '100%' }} />
        </div>
        {pwError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{pwError}</p>}
        <button type="submit" className="btn btn-secondary" disabled={pwSaving}>{pwSaving ? '...' : 'Jelszó mentése'}</button>
      </form>

      <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Saját eredményeim (játékos + tesztelt MI-k)</h3>
      {loading ? (
        <p className="empty-state">Betöltés...</p>
      ) : scores.length === 0 ? (
        <p className="empty-state">Még nincs mentett eredmény.</p>
      ) : (
        <ul className="results-list">
          {scores.slice(0, 50).map((s) => (
            <li key={s.id}>
              <strong>{s.score}</strong> pont · {s.tick} lépés · hossz {s.length} · <strong>{modeLabel(s.mode, s.ai_strategy)}</strong> · {new Date(s.created_at).toLocaleString('hu-HU')}
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>Vissza</button>
    </div>
  )
}

import { useState } from 'react'
import { login } from '../api'
import type { User } from '../api'

interface LoginFormProps {
  onSuccess: (token: string, user: User) => void
  onBack: () => void
}

export function LoginForm({ onSuccess, onBack }: LoginFormProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!usernameOrEmail.trim() || !password) {
      setError('Felhasználónév/e-mail és jelszó megadása kötelező.')
      return
    }
    setLoading(true)
    try {
      const { token, user } = await login(usernameOrEmail.trim(), password)
      onSuccess(token, user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bejelentkezés sikertelen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="card-subtitle">Bejelentkezés</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="empty-state" style={{ color: 'var(--danger)' }}>{error}</p>}
        <div className="form-group">
          <label>Felhasználónév vagy e-mail</label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            autoComplete="username"
            style={{ maxWidth: '100%' }}
          />
        </div>
        <div className="form-group">
          <label>Jelszó</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{ maxWidth: '100%' }}
          />
        </div>
        <div className="btn-group">
          <button type="submit" className="btn" disabled={loading}>{loading ? '...' : 'Bejelentkezés'}</button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>Vissza</button>
        </div>
      </form>
    </div>
  )
}

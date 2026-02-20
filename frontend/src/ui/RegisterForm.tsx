import { useState } from 'react'
import { register } from '../api'
import type { User } from '../api'

interface RegisterFormProps {
  onSuccess: (token: string, user: User) => void
  onBack: () => void
}

export function RegisterForm({ onSuccess, onBack }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !username.trim() || !password || !passwordConfirm) {
      setError('Minden mező kitöltése kötelező.')
      return
    }
    if (password.length < 6) {
      setError('A jelszó legalább 6 karakter legyen.')
      return
    }
    if (password !== passwordConfirm) {
      setError('A két jelszó nem egyezik.')
      return
    }
    setLoading(true)
    try {
      const { token, user } = await register(email.trim(), username.trim(), password, passwordConfirm)
      onSuccess(token, user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regisztráció sikertelen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="card-subtitle">Regisztráció</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="empty-state" style={{ color: 'var(--danger)' }}>{error}</p>}
        <div className="form-group">
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{ maxWidth: '100%' }}
          />
        </div>
        <div className="form-group">
          <label>Felhasználónév (3–32 karakter)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            style={{ maxWidth: '100%' }}
          />
        </div>
        <div className="form-group">
          <label>Jelszó (min. 6 karakter)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={{ maxWidth: '100%' }}
          />
        </div>
        <div className="form-group">
          <label>Jelszó ismétlése</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            style={{ maxWidth: '100%' }}
          />
        </div>
        <div className="btn-group">
          <button type="submit" className="btn" disabled={loading}>{loading ? '...' : 'Regisztráció'}</button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>Vissza</button>
        </div>
      </form>
    </div>
  )
}

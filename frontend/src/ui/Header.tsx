import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'

interface HeaderProps {
  onLoginClick: () => void
  onRegisterClick: () => void
  onProfileClick: () => void
}

export function Header({ onLoginClick, onRegisterClick, onProfileClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  return (
    <header className="app-header">
      <h1 className="app-title">Snake – MI</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.username}</span>
            <button type="button" className="theme-toggle" onClick={onProfileClick}>
              Profil
            </button>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => logout()}
            >
              Kijelentkezés
            </button>
          </>
        ) : (
          <>
            <button type="button" className="theme-toggle" onClick={onLoginClick}>
              Bejelentkezés
            </button>
            <button type="button" className="theme-toggle" onClick={onRegisterClick}>
              Regisztráció
            </button>
          </>
        )}
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Világos téma' : 'Sötét téma'}
          aria-label={theme === 'dark' ? 'Világos téma bekapcsolása' : 'Sötét téma bekapcsolása'}
        >
          {theme === 'dark' ? '☀️ Világos' : '🌙 Sötét'}
        </button>
      </div>
    </header>
  )
}

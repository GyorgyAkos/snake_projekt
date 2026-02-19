import { useTheme } from '../ThemeContext'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  return (
    <header className="app-header">
      <h1 className="app-title">Snake – MI</h1>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Világos téma' : 'Sötét téma'}
        aria-label={theme === 'dark' ? 'Világos téma bekapcsolása' : 'Sötét téma bekapcsolása'}
      >
        {theme === 'dark' ? '☀️ Világos' : '🌙 Sötét'}
      </button>
    </header>
  )
}

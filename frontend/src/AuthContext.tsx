import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User } from './api'
import { getMe } from './api'

const TOKEN_KEY = 'snake_token'
const USER_KEY = 'snake_user'

type AuthContextValue = {
  user: User | null
  token: string | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  loadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  const setAuth = useCallback((t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const loadUser = useCallback(async () => {
    if (!token) return
    try {
      const { user: u } = await getMe()
      setUser(u)
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    } catch {
      logout()
    }
  }, [token, logout])

  useEffect(() => {
    if (token && !user) loadUser()
  }, [token, user, loadUser])

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

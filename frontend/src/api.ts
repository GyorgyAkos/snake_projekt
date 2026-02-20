const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function getToken(): string | null {
  return localStorage.getItem('snake_token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface User {
  id: number
  email: string
  username: string
  created_at?: string
}

export interface ScoreEntry {
  id: number
  score: number
  tick: number
  length: number
  mode: 'player' | 'ai'
  ai_strategy: string | null
  created_at: string
}

export async function register(email: string, username: string, password: string, passwordConfirm: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, passwordConfirm }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export async function login(usernameOrEmail: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export async function getMe(): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/api/profile/me`, { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export async function updateUsername(username: string): Promise<{ username: string }> {
  const res = await fetch(`${API_BASE}/api/profile/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ username }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export async function updatePassword(currentPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/profile/me/password`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
}

export async function fetchScores(): Promise<{ scores: ScoreEntry[] }> {
  const res = await fetch(`${API_BASE}/api/scores`, { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export async function submitScore(score: number, tick: number, length: number, mode: 'player' | 'ai', aiStrategy?: string | null): Promise<void> {
  const res = await fetch(`${API_BASE}/api/scores`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ score, tick, length, mode, ai_strategy: mode === 'ai' ? (aiStrategy || null) : null }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
}

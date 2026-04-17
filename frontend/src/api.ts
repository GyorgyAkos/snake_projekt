const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/** Snake AI HTTP (benchmark, health) — alapértelmezés egyezzen a WebSocket hosttal */
const AI_HTTP_BASE = import.meta.env.VITE_AI_HTTP_URL ?? 'http://localhost:8000'

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

export interface BenchmarkSummary {
  strategy: string
  runs: number
  rows: number
  cols: number
  max_steps: number
  seed_base: number
  score_mean: number
  score_median: number
  steps_mean: number
  steps_median: number
  death_counts: Record<string, number>
  reached_first_food: number
}

export async function fetchBenchmarkSummaries(): Promise<{ summaries: BenchmarkSummary[]; benchmark_dir?: string; error?: string }> {
  const res = await fetch(`${AI_HTTP_BASE}/benchmark/summaries`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { detail?: string }).detail || res.statusText)
  return data as { summaries: BenchmarkSummary[]; benchmark_dir?: string; error?: string }
}

export function benchmarkPlotUrl(filename: string): string {
  return `${AI_HTTP_BASE}/benchmark/plots/${encodeURIComponent(filename)}`
}

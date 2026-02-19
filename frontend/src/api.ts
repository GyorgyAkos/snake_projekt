/** REST hívások a Node backend felé (későbbi bővítés). */
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchScores(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/scores`)
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export async function submitScore(score: number, tick: number, length: number): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, tick, length }),
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

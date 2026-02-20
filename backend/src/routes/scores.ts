import { Router, Request, Response } from 'express'
import { getDatabase } from '../db/sqlite.js'
import { authMiddleware, type JwtPayload } from '../middleware/auth.js'

const router = Router()

type AuthRequest = Request & { user: JwtPayload }

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const { user } = req as AuthRequest
  const db = getDatabase()
  const rows = db.prepare(`
    SELECT id, score, tick, length, mode, ai_strategy, created_at
    FROM scores WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 200
  `).all(user.userId) as Array<{ id: number; score: number; tick: number; length: number; mode: string; ai_strategy: string | null; created_at: string }>
  res.json({
    scores: rows.map((r) => ({
      id: r.id,
      score: r.score,
      tick: r.tick,
      length: r.length,
      mode: r.mode as 'player' | 'ai',
      ai_strategy: r.ai_strategy,
      created_at: r.created_at,
    })),
  })
})

router.post('/', authMiddleware, (req: Request, res: Response) => {
  const { user } = req as AuthRequest
  const { score, tick, length, mode, ai_strategy } = req.body ?? {}
  if (typeof score !== 'number' || typeof tick !== 'number' || typeof length !== 'number') {
    res.status(400).json({ error: 'score, tick és length számok kellenek.' })
    return
  }
  const modeVal = mode === 'ai' ? 'ai' : 'player'
  const aiStrategyVal = (modeVal === 'ai' && (ai_strategy === 'astar' || ai_strategy === 'hamilton')) ? ai_strategy : null
  const db = getDatabase()
  db.prepare(
    'INSERT INTO scores (user_id, score, tick, length, mode, ai_strategy) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(user.userId, score, tick, length, modeVal, aiStrategyVal)
  res.status(201).json({ ok: true })
})

export default router

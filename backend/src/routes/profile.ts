import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { getDatabase } from '../db/sqlite.js'
import { authMiddleware, type JwtPayload } from '../middleware/auth.js'

const router = Router()
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,32}$/

type AuthRequest = Request & { user: JwtPayload }

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const { user } = req as AuthRequest
  const db = getDatabase()
  const row = db.prepare('SELECT id, email, username, created_at FROM users WHERE id = ?').get(user.userId) as { id: number; email: string; username: string; created_at: string } | undefined
  if (!row) {
    res.status(404).json({ error: 'Felhasználó nem található.' })
    return
  }
  res.json({ user: { id: row.id, email: row.email, username: row.username, created_at: row.created_at } })
})

router.patch('/me', authMiddleware, (req: Request, res: Response) => {
  const { user } = req as AuthRequest
  const { username } = req.body ?? {}
  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Új felhasználónév megadása kötelező.' })
    return
  }
  const usernameNorm = String(username).trim()
  if (!USERNAME_REGEX.test(usernameNorm)) {
    res.status(400).json({ error: 'Felhasználónév 3–32 karakter, csak betű, szám, kötőjel és aláhúzás.' })
    return
  }
  const db = getDatabase()
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = ? AND id != ?').get(usernameNorm.toLowerCase(), user.userId)
  if (existing) {
    res.status(400).json({ error: 'Ez a felhasználónév már foglalt.' })
    return
  }
  db.prepare('UPDATE users SET username = ? WHERE id = ?').run(usernameNorm, user.userId)
  res.json({ username: usernameNorm })
})

router.patch('/me/password', authMiddleware, (req: Request, res: Response) => {
  const { user } = req as AuthRequest
  const { currentPassword, newPassword, newPasswordConfirm } = req.body ?? {}
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    res.status(400).json({ error: 'Jelenlegi és új jelszó (ismétlés) megadása kötelező.' })
    return
  }
  if (String(newPassword).length < 6) {
    res.status(400).json({ error: 'Az új jelszó legalább 6 karakter legyen.' })
    return
  }
  if (String(newPassword) !== String(newPasswordConfirm)) {
    res.status(400).json({ error: 'A két új jelszó nem egyezik.' })
    return
  }
  const db = getDatabase()
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.userId) as { password_hash: string } | undefined
  if (!row || !bcrypt.compareSync(String(currentPassword), row.password_hash)) {
    res.status(401).json({ error: 'A jelenlegi jelszó hibás.' })
    return
  }
  const password_hash = bcrypt.hashSync(String(newPassword), 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(password_hash, user.userId)
  res.json({ ok: true })
})

export default router

import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { getDatabase } from '../db/sqlite.js'
import { signToken, type JwtPayload } from '../middleware/auth.js'

const router = Router()
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,32}$/

router.post('/register', (req: Request, res: Response) => {
  const { email, username, password, passwordConfirm } = req.body ?? {}
  if (!email || !username || !password || !passwordConfirm) {
    res.status(400).json({ error: 'Kérjük töltsd ki az összes mezőt.' })
    return
  }
  if (!EMAIL_REGEX.test(String(email).trim())) {
    res.status(400).json({ error: 'Érvényes e-mail címet adj meg.' })
    return
  }
  if (!USERNAME_REGEX.test(String(username).trim())) {
    res.status(400).json({ error: 'Felhasználónév 3–32 karakter, csak betű, szám, kötőjel és aláhúzás.' })
    return
  }
  if (String(password).length < 6) {
    res.status(400).json({ error: 'A jelszó legalább 6 karakter legyen.' })
    return
  }
  if (String(password) !== String(passwordConfirm)) {
    res.status(400).json({ error: 'A két jelszó nem egyezik.' })
    return
  }
  const db = getDatabase()
  const emailNorm = String(email).trim().toLowerCase()
  const usernameNorm = String(username).trim()
  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(emailNorm)
  if (existingEmail) {
    res.status(400).json({ error: 'Ez az e-mail már regisztrálva van.' })
    return
  }
  const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(usernameNorm.toLowerCase())
  if (existingUser) {
    res.status(400).json({ error: 'Ez a felhasználónév már foglalt.' })
    return
  }
  const password_hash = bcrypt.hashSync(String(password), 10)
  const result = db.prepare(
    'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)'
  ).run(emailNorm, usernameNorm, password_hash)
  const userId = result.lastInsertRowid as number
  const token = signToken({ userId, username: usernameNorm })
  res.status(201).json({ token, user: { id: userId, email: emailNorm, username: usernameNorm } })
})

router.post('/login', (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body ?? {}
  if (!usernameOrEmail || !password) {
    res.status(400).json({ error: 'Felhasználónév/e-mail és jelszó megadása kötelező.' })
    return
  }
  const db = getDatabase()
  const input = String(usernameOrEmail).trim()
  const isEmail = EMAIL_REGEX.test(input)
  const row = isEmail
    ? db.prepare('SELECT id, username, email, password_hash FROM users WHERE email = ?').get(input.toLowerCase()) as { id: number; username: string; email: string; password_hash: string } | undefined
    : db.prepare('SELECT id, username, email, password_hash FROM users WHERE LOWER(username) = ?').get(input.toLowerCase()) as { id: number; username: string; email: string; password_hash: string } | undefined
  if (!row || !bcrypt.compareSync(String(password), row.password_hash)) {
    res.status(401).json({ error: 'Hibás felhasználónév/e-mail vagy jelszó.' })
    return
  }
  const token = signToken({ userId: row.id, username: row.username })
  res.json({ token, user: { id: row.id, email: row.email, username: row.username } })
})

export default router

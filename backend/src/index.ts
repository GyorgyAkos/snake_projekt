import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import scoresRoutes from './routes/scores.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/scores', scoresRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'snake-backend' })
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

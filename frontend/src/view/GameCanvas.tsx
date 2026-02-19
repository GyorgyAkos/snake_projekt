import { useRef, useEffect } from 'react'
import type { Pos } from '../core/types'
import type { Theme } from '../ThemeContext'

const CELL_PX = 18
const PAD = 2

const COLORS = {
  dark: {
    bg: '#0f1419',
    gridLine: '#4a5568',
    snake: '#48bb78',
    snakeHead: '#38a169',
    food: '#fc8181',
  },
  light: {
    bg: '#f7fafc',
    gridLine: '#cbd5e0',
    snake: '#38a169',
    snakeHead: '#2f855a',
    food: '#e53e3e',
  },
} as const

interface GameCanvasProps {
  rows: number
  cols: number
  snakeBody: Pos[]
  food: Pos | null
  phase: string
  theme: Theme
}

export function GameCanvas({ rows, cols, snakeBody, food, phase, theme }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const width = cols * (CELL_PX + PAD) + PAD
  const height = rows * (CELL_PX + PAD) + PAD
  const colors = COLORS[theme]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, width, height)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = PAD + c * (CELL_PX + PAD)
        const y = PAD + r * (CELL_PX + PAD)
        ctx.strokeStyle = colors.gridLine
        ctx.strokeRect(x, y, CELL_PX, CELL_PX)
      }
    }
    snakeBody.forEach(([x, y], i) => {
      const px = PAD + x * (CELL_PX + PAD)
      const py = PAD + y * (CELL_PX + PAD)
      ctx.fillStyle = i === 0 ? colors.snakeHead : colors.snake
      ctx.fillRect(px + 1, py + 1, CELL_PX - 2, CELL_PX - 2)
    })
    if (food) {
      const [fx, fy] = food
      const px = PAD + fx * (CELL_PX + PAD)
      const py = PAD + fy * (CELL_PX + PAD)
      ctx.fillStyle = colors.food
      ctx.beginPath()
      ctx.arc(px + CELL_PX / 2, py + CELL_PX / 2, CELL_PX / 2 - 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [rows, cols, snakeBody, food, phase, width, height, colors, theme])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', margin: '0 auto', borderRadius: 8, boxShadow: '0 4px 12px var(--shadow)' }}
      aria-label="Snake játéktér"
    />
  )
}

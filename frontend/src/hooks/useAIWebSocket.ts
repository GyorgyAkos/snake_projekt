import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameStateSnapshot } from '../core/types'

const DEFAULT_WS_URL = 'ws://localhost:8000/ws'
const ACTION_TIMEOUT_MS = 80

export function useAIWebSocket(wsUrl: string | undefined) {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const url = wsUrl ?? DEFAULT_WS_URL

  useEffect(() => {
    if (!url.startsWith('ws')) return
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    return () => {
      ws.close()
      wsRef.current = null
      setConnected(false)
    }
  }, [url])

  const getAction = useCallback((state: GameStateSnapshot, strategy?: string): Promise<string | null> => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return Promise.resolve(null)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), ACTION_TIMEOUT_MS)
      const onMessage = (e: MessageEvent) => {
        clearTimeout(timeout)
        ws.removeEventListener('message', onMessage)
        try {
          const data = JSON.parse(e.data as string)
          if (data.action && ['Up', 'Right', 'Down', 'Left'].includes(data.action)) {
            resolve(data.action)
          } else resolve(null)
        } catch {
          resolve(null)
        }
      }
      ws.addEventListener('message', onMessage)
      const payload: Record<string, unknown> = {
        snake: state.snake,
        direction: state.direction,
        food: state.food,
        rows: state.rows,
        cols: state.cols,
        seed: state.seed,
        tick: state.tick,
        score: state.score,
      }
      if (strategy != null) payload.strategy = strategy
      ws.send(JSON.stringify(payload))
    })
  }, [])

  return { connected, getAction }
}

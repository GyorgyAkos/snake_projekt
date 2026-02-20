import { useCallback, useEffect, useRef } from 'react'
import type { GameState } from '../core/game'
import { tick, getSnapshot, setDirection } from '../core/game'
import { placeholderStrategy } from '../ai/Strategy'
import { useAIWebSocket } from './useAIWebSocket'

const WS_URL = import.meta.env.VITE_AI_WS_URL
  ? import.meta.env.VITE_AI_WS_URL.replace(/^http/, 'ws') + (import.meta.env.VITE_AI_WS_URL.endsWith('/ws') ? '' : '/ws')
  : 'ws://localhost:8000/ws'

/**
 * Játékciklus MI módban: tick, majd irány lekérése (WebSocket vagy helyi stratégia), majd setState.
 * Így az MI módban is látszik a kígyó mozgása, és opcionálisan az ai_service válasza vezérli.
 */
export function useAIGameLoop(
  state: GameState,
  setState: (s: GameState) => void,
  enabled: boolean,
  strategyName: string = 'astar'
) {
  const stateRef = useRef(state)
  stateRef.current = state
  const { connected, getAction } = useAIWebSocket(WS_URL)

  const runTick = useCallback(async () => {
    const prev = stateRef.current
    const newState = tick(prev)
    const snapshot = getSnapshot(newState)
    let action: string
    if (connected) {
      const wsAction = await getAction(snapshot, strategyName)
      action = wsAction ?? placeholderStrategy.nextMove(snapshot)
    } else {
      action = placeholderStrategy.nextMove(snapshot)
    }
    setState(setDirection(newState, action as 'Up' | 'Right' | 'Down' | 'Left'))
  }, [connected, getAction, setState, strategyName])

  useEffect(() => {
    if (!enabled || state.phase !== 'RUNNING') return
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      if (cancelled) return
      timeoutId = setTimeout(async () => {
        if (cancelled) return
        await runTick()
        schedule()
      }, state.tickMs)
    }
    schedule()
    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [enabled, state.phase, state.tickMs, runTick])

  return { aiConnected: connected }
}

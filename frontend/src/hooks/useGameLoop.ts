import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameState } from '../core/game'
import { tick } from '../core/game'

export function useGameLoop(
  state: GameState,
  setState: (s: GameState) => void,
  enabled: boolean = true
): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const runTick = useCallback(() => {
    setState(tick(stateRef.current))
  }, [setState])

  useEffect(() => {
    if (!enabled || state.phase !== 'RUNNING') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    intervalRef.current = setInterval(runTick, state.tickMs)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled, state.phase, state.tickMs, runTick])
}

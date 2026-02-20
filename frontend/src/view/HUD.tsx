interface HUDProps {
  score: number
  length: number
  tick: number
  phase: string
  tickMs: number
  /** MI mód: true = backend (ai_service) csatlakozva, false = helyi stratégia */
  aiConnected?: boolean
  /** MI stratégia neve (pl. astar, hamilton) – csak MI módban */
  aiStrategy?: string
}

const phaseLabel: Record<string, string> = {
  INIT: 'Készül',
  RUNNING: 'Fut',
  PAUSED: 'Szünet',
  GAME_OVER: 'Vége',
}

const strategyLabel: Record<string, string> = {
  astar: 'A*',
  hamilton: 'Hamilton',
}

export function HUD({ score, length, tick, phase, tickMs, aiConnected, aiStrategy }: HUDProps) {
  return (
    <div className="hud">
      <span>Pont: <strong>{score}</strong></span>
      <span>Hossz: <strong>{length}</strong></span>
      <span>Lépés: <strong>{tick}</strong></span>
      <span>Sebesség: <strong>{Math.round(1000 / tickMs)}</strong> tick/s</span>
      <span>Státusz: <strong>{phaseLabel[phase] ?? phase}</strong></span>
      {aiConnected !== undefined && (
        <span title={aiConnected ? 'ai_service WebSocket' : 'Helyi stratégia'}>
          MI: <strong>{aiConnected ? `backend (${strategyLabel[aiStrategy ?? 'astar'] ?? aiStrategy})` : 'helyi'}</strong>
        </span>
      )}
    </div>
  )
}

import { useState, useCallback, useEffect } from 'react'
import type { Direction } from './core/types'
import type { GameState } from './core/game'
import {
  createGame,
  setDirection,
  startGame,
  pauseGame,
  resumeGame,
} from './core/game'
import { useGameLoop } from './hooks/useGameLoop'
import { useAIGameLoop } from './hooks/useAIGameLoop'
import { useTheme } from './ThemeContext'
import { loadConfig, saveConfig } from './io/config'
import { loadScores, saveScore } from './io/storage'
import { GameCanvas } from './view/GameCanvas'
import { HUD } from './view/HUD'
import { Header } from './ui/Header'
import { MainMenu } from './ui/MainMenu'
import { Settings } from './ui/Settings'
import { Results } from './ui/Results'

type Screen = 'menu' | 'settings' | 'results' | 'game'

function App() {
  const { theme } = useTheme()
  const [screen, setScreen] = useState<Screen>('menu')
  const [config, setConfig] = useState(loadConfig)
  const [gameState, setGameState] = useState<GameState>(() => createGame(config))
  const [gameMode, setGameMode] = useState<'player' | 'ai'>('player')
  const [scores, setScores] = useState(loadScores)

  const { aiConnected } = useAIGameLoop(
    gameState,
    setGameState,
    screen === 'game' && gameMode === 'ai'
  )
  useGameLoop(
    gameState,
    setGameState,
    screen === 'game' && gameMode === 'player'
  )

  const startNewGame = useCallback(
    (mode: 'player' | 'ai') => {
      const seed = config.seed ?? Date.now()
      setGameState(createGame({ ...config, seed }))
      setGameMode(mode)
      setScreen('game')
    },
    [config]
  )

  useEffect(() => {
    if (screen !== 'game') return
    if (gameState.phase === 'RUNNING' && gameMode === 'player') {
      const onKey = (e: KeyboardEvent) => {
        const map: Record<string, Direction> = {
          ArrowUp: 'Up',
          ArrowDown: 'Down',
          ArrowLeft: 'Left',
          ArrowRight: 'Right',
          w: 'Up',
          s: 'Down',
          a: 'Left',
          d: 'Right',
        }
        const dir = map[e.key]
        if (dir) {
          e.preventDefault()
          setGameState((s) => setDirection(s, dir))
        }
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault()
          setGameState((s) => (s.phase === 'RUNNING' ? pauseGame(s) : resumeGame(s)))
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault()
          startNewGame(gameMode)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
  }, [screen, gameState.phase, gameMode, startNewGame])

  useEffect(() => {
    if (screen === 'game') {
      setGameState((s) => startGame(s))
    }
  }, [screen])

  useEffect(() => {
    if (gameState.phase === 'GAME_OVER' && screen === 'game') {
      saveScore({
        score: gameState.score,
        tick: gameState.tick,
        length: gameState.snakeBody.length,
        date: new Date().toISOString(),
        mode: gameMode,
      })
      setScores(loadScores())
    }
  }, [gameState.phase, screen, gameMode, gameState.score, gameState.tick, gameState.snakeBody.length])

  if (screen === 'menu') {
    return (
      <div className="app-shell">
        <Header />
        <MainMenu
          onStartPlayer={() => startNewGame('player')}
          onStartAI={() => startNewGame('ai')}
          onSettings={() => setScreen('settings')}
          onResults={() => {
            setScores(loadScores())
            setScreen('results')
          }}
        />
      </div>
    )
  }

  if (screen === 'settings') {
    return (
      <div className="app-shell">
        <Header />
        <Settings
          config={config}
          onSave={(c) => {
            setConfig(c)
            saveConfig(c)
          }}
          onBack={() => setScreen('menu')}
        />
      </div>
    )
  }

  if (screen === 'results') {
    return (
      <div className="app-shell">
        <Header />
        <Results scores={scores} onBack={() => setScreen('menu')} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header />
      <HUD
        score={gameState.score}
        length={gameState.snakeBody.length}
        tick={gameState.tick}
        phase={gameState.phase}
        tickMs={gameState.tickMs}
        aiConnected={gameMode === 'ai' ? aiConnected : undefined}
      />
      <GameCanvas
        rows={gameState.rows}
        cols={gameState.cols}
        snakeBody={gameState.snakeBody}
        food={gameState.food}
        phase={gameState.phase}
        theme={theme}
      />
      <div className="game-actions">
        {gameState.phase === 'GAME_OVER' && (
          <p className="game-over-msg">
            Játék vége. Pont: <span>{gameState.score}</span>
          </p>
        )}
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setScreen('menu')}>
            Főmenü
          </button>
          <button type="button" className="btn" onClick={() => startNewGame(gameMode)}>
            Új játék (R)
          </button>
        </div>
      </div>
    </div>
  )
}

export default App

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
import { useAuth } from './AuthContext'
import { loadConfig, saveConfig } from './io/config'
import { loadScores, saveScore, clearScores } from './io/storage'
import { submitScore as submitScoreApi, fetchScores } from './api'
import type { ScoreEntry } from './api'
import type { StoredScore } from './io/storage'
import { GameCanvas } from './view/GameCanvas'
import { HUD } from './view/HUD'
import { Header } from './ui/Header'
import { MainMenu } from './ui/MainMenu'
import { Settings } from './ui/Settings'
import { Results } from './ui/Results'
import { LoginForm } from './ui/LoginForm'
import { RegisterForm } from './ui/RegisterForm'
import { Profile } from './ui/Profile'

type Screen = 'menu' | 'settings' | 'results' | 'game' | 'login' | 'register' | 'profile'

function App() {
  const { theme } = useTheme()
  const { token, setAuth } = useAuth()
  const [screen, setScreen] = useState<Screen>('menu')
  const [config, setConfig] = useState(loadConfig)
  const [gameState, setGameState] = useState<GameState>(() => createGame(config))
  const [gameMode, setGameMode] = useState<'player' | 'ai'>('player')
  const [scores, setScores] = useState<StoredScore[]>(loadScores)

  useEffect(() => {
    clearScores()
  }, [])

  const { aiConnected } = useAIGameLoop(
    gameState,
    setGameState,
    screen === 'game' && gameMode === 'ai',
    config.ai?.strategy ?? 'astar'
  )
  useGameLoop(
    gameState,
    setGameState,
    screen === 'game' && gameMode === 'player'
  )

  const startNewGame = useCallback(
    (mode: 'player' | 'ai') => {
      const seed = config.seed ?? Date.now()
      const newState = createGame({ ...config, seed })
      setGameState(newState)
      setGameMode(mode)
      setScreen('game')
    },
    [config]
  )

  useEffect(() => {
    if (screen !== 'game') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (gameState.phase === 'RUNNING' || gameState.phase === 'PAUSED') {
          e.preventDefault()
          setGameState((s) => (s.phase === 'RUNNING' ? pauseGame(s) : resumeGame(s)))
        }
      }
      if (gameMode === 'player' && (gameState.phase === 'RUNNING' || gameState.phase === 'INIT')) {
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
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        startNewGame(gameMode)
      }
      if (e.key === 'Enter' && gameState.phase === 'INIT') {
        e.preventDefault()
        setGameState((s) => startGame(s))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, gameState.phase, gameMode, startNewGame])

  useEffect(() => {
    if (gameState.phase === 'GAME_OVER' && screen === 'game') {
      const aiStrategy = gameMode === 'ai' ? (config.ai?.strategy ?? null) : null
      saveScore({
        score: gameState.score,
        tick: gameState.tick,
        length: gameState.snakeBody.length,
        date: new Date().toISOString(),
        mode: gameMode,
        aiStrategy: aiStrategy ?? undefined,
      })
      setScores(loadScores())
      if (token) {
        submitScoreApi(
          gameState.score,
          gameState.tick,
          gameState.snakeBody.length,
          gameMode,
          aiStrategy
        ).catch(() => {})
      }
    }
  }, [gameState.phase, screen, gameMode, gameState.score, gameState.tick, gameState.snakeBody.length, config.ai?.strategy, token])

  const headerProps = {
    onLoginClick: () => setScreen('login'),
    onRegisterClick: () => setScreen('register'),
    onProfileClick: () => setScreen('profile'),
  }

  if (screen === 'login') {
    return (
      <div className="app-shell">
        <Header {...headerProps} />
        <LoginForm onSuccess={(t, u) => { setAuth(t, u); setScreen('menu') }} onBack={() => setScreen('menu')} />
      </div>
    )
  }
  if (screen === 'register') {
    return (
      <div className="app-shell">
        <Header {...headerProps} />
        <RegisterForm onSuccess={(t, u) => { setAuth(t, u); setScreen('menu') }} onBack={() => setScreen('menu')} />
      </div>
    )
  }
  if (screen === 'profile') {
    return (
      <div className="app-shell">
        <Header {...headerProps} />
        <Profile onBack={() => setScreen('menu')} />
      </div>
    )
  }
  if (screen === 'menu') {
    return (
      <div className="app-shell">
        <Header {...headerProps} />
        <MainMenu
          onStartPlayer={() => startNewGame('player')}
          onStartAI={() => startNewGame('ai')}
          onSettings={() => setScreen('settings')}
          onResults={() => {
            if (token) {
              fetchScores()
                .then(({ scores: apiScores }) => {
                  const mapped: StoredScore[] = apiScores.map((e: ScoreEntry) => ({
                    score: e.score,
                    tick: e.tick,
                    length: e.length,
                    mode: e.mode,
                    aiStrategy: e.ai_strategy ?? undefined,
                    date: e.created_at,
                  }))
                  setScores(mapped)
                  setScreen('results')
                })
                .catch(() => {
                  setScores([])
                  setScreen('results')
                })
            } else {
              setScores(loadScores())
              setScreen('results')
            }
          }}
          onProfile={() => setScreen('profile')}
          isLoggedIn={!!token}
        />
      </div>
    )
  }

  if (screen === 'settings') {
    return (
      <div className="app-shell">
        <Header {...headerProps} />
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
        <Header {...headerProps} />
        <Results scores={scores} onBack={() => setScreen('menu')} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header {...headerProps} />
      <HUD
        score={gameState.score}
        length={gameState.snakeBody.length}
        tick={gameState.tick}
        phase={gameState.phase}
        tickMs={gameState.tickMs}
        aiConnected={gameMode === 'ai' ? aiConnected : undefined}
        aiStrategy={gameMode === 'ai' ? (config.ai?.strategy ?? 'astar') : undefined}
      />
      <div className="game-area-wrap">
        {gameState.phase === 'INIT' && (
          <div className="game-start-overlay">
            <button type="button" className="btn game-start-btn" onClick={() => setGameState((s) => startGame(s))}>
              Start
            </button>
          </div>
        )}
        <GameCanvas
          rows={gameState.rows}
          cols={gameState.cols}
          snakeBody={gameState.snakeBody}
          food={gameState.food}
          phase={gameState.phase}
          theme={theme}
        />
      </div>
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
          {gameState.phase === 'RUNNING' && (
            <button type="button" className="btn btn-secondary" onClick={() => setGameState((s) => pauseGame(s))}>
              Pause (P)
            </button>
          )}
          {gameState.phase === 'PAUSED' && (
            <button type="button" className="btn" onClick={() => setGameState((s) => resumeGame(s))}>
              Folytatás (P)
            </button>
          )}
          <button type="button" className="btn" onClick={() => startNewGame(gameMode)}>
            Új játék (R)
          </button>
        </div>
      </div>
    </div>
  )
}

export default App

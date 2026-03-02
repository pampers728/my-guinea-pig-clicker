"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAntiCheat } from "@/hooks/useAntiCheat"

interface FallingCarrot {
  id: number
  x: number
  y: number
  speed: number
  caught: boolean
}

interface CatchCarrotGameProps {
  onReward: (multiplier: number, duration: number) => void
  onClose: () => void
  isOpen: boolean
}

export function CatchCarrotGame({ onReward, onClose, isOpen }: CatchCarrotGameProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [carrots, setCarrots] = useState<FallingCarrot[]>([])
  const [showReward, setShowReward] = useState(false)
  const [earnedReward, setEarnedReward] = useState<{ multiplier: number; duration: number } | null>(null)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<number | undefined>(undefined)
  const carrotIdRef = useRef(0)

  // Добавляем античит
  const { validateClick, isBlocked, warnings } = useAntiCheat()

  const spawnCarrot = useCallback(() => {
    if (!gameAreaRef.current) return

    const gameArea = gameAreaRef.current.getBoundingClientRect()
    const newCarrot: FallingCarrot = {
      id: carrotIdRef.current++,
      x: Math.random() * (gameArea.width - 40),
      y: -40,
      speed: 2 + Math.random() * 3,
      caught: false
    }

    setCarrots(prev => [...prev, newCarrot])
  }, [])

  // Модифицируем catchCarrot с защитой
  const catchCarrot = useCallback((carrotId: number, event: React.MouseEvent) => {
    // Проверяем блокировку
    if (isBlocked) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Валидация клика
    if (!validateClick(x, y)) {
      return
    }

    setCarrots(prev =>
      prev.map(carrot =>
        carrot.id === carrotId ? { ...carrot, caught: true } : carrot
      )
    )
    setScore(prev => prev + 1)
  }, [validateClick, isBlocked])

  const startGame = () => {
    // Блокируем старт игры если пользователь заблокирован
    if (isBlocked) return
    
    setGameState('playing')
    setScore(0)
    setTimeLeft(20)
    setCarrots([])
    carrotIdRef.current = 0
  }

  const endGame = () => {
    setGameState('finished')
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }

    // Определяем награду
    let reward = null
    if (score >= 80) {
      reward = { multiplier: 3, duration: 10 }
    } else if (score >= 50) {
      reward = { multiplier: 2, duration: 10 }
    }

    setEarnedReward(reward)
    setShowReward(true)
  }

  const claimReward = () => {
    if (earnedReward) {
      onReward(earnedReward.multiplier, earnedReward.duration)
    }
    setShowReward(false)
    onClose()
  }

  const watchAdForDoubleReward = () => {
    if (earnedReward) {
      onReward(earnedReward.multiplier * 2, earnedReward.duration)
    }
    setShowReward(false)
    onClose()
  }

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      setCarrots(prev => {
        const updated = prev
          .filter(carrot => !carrot.caught && carrot.y < 400)
          .map(carrot => ({ 
            ...carrot, 
            y: carrot.y + carrot.speed 
          }))
        return updated
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Spawn carrots
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawner = setInterval(spawnCarrot, 800)
    return () => clearInterval(spawner)
  }, [gameState, spawnCarrot])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-orange-900/90 to-yellow-900/90 border-orange-500/50 relative">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-white">
            🥕 Catch the Carrot
            {warnings > 0 && (
              <Badge className="ml-2 bg-yellow-600 text-xs">
                🛡️ {warnings}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {gameState === 'waiting' && (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">🥕</div>
            <p className="text-white">
              Ловите падающие морковки в течение 20 секунд!
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>🏆 50+ очков → x2 доход на 10 минут</p>
              <p>🏆 80+ очков → x3 доход на 10 минут</p>
            </div>
            
            {isBlocked ? (
              <div className="space-y-2">
                <Button disabled className="bg-red-600 opacity-50" size="lg">
                  🛡️ Игра заблокирована
                </Button>
                <p className="text-red-400 text-sm">
                  Обнаружена подозрительная активность
                </p>
              </div>
            ) : (
              <Button onClick={startGame} size="lg" className="bg-orange-600 hover:bg-orange-700">
                Начать игру
              </Button>
            )}
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-lg">
                Очки: {score}
              </Badge>
              <Badge variant="destructive" className="text-lg">
                Время: {timeLeft}с
              </Badge>
            </div>

            <div
              ref={gameAreaRef}
              className="relative h-80 bg-gradient-to-b from-sky-400 to-green-400 rounded-lg overflow-hidden border-2 border-orange-500"
              style={{ cursor: 'crosshair' }}
            >
              {carrots.map(carrot => (
                <div
                  key={carrot.id}
                  className={`absolute w-8 h-8 text-2xl cursor-pointer transition-opacity ${
                    carrot.caught ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{
                    left: carrot.x,
                    top: carrot.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={(event) => catchCarrot(carrot.id, event)}
                >
                  🥕
                </div>
              ))}

              {carrots.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  Ждите морковки...
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'finished' && !showReward && (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">🎯</div>
            <h3 className="text-xl font-bold text-white">
              Игра окончена!
            </h3>
            <p className="text-lg text-yellow-400">
              Поймано морковок: {score}
            </p>
            <Button onClick={onClose}>
              Закрыть
            </Button>
          </div>
        )}

        {showReward && (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">🏆</div>
            <h3 className="text-xl font-bold text-white">
              Поздравляем!
            </h3>
            {earnedReward ? (
              <>
                <p className="text-lg text-green-400">
                  x{earnedReward.multiplier} доход на {earnedReward.duration} минут!
                </p>
                <div className="space-y-2">
                  <Button onClick={claimReward} className="w-full">
                    Получить награду
                  </Button>
                  <Button
                    onClick={watchAdForDoubleReward}
                    variant="outline"
                    className="w-full"
                  >
                    📺 Реклама → Удвоить награду
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400">
                  Нужно поймать минимум 50 морковок для награды
                </p>
                <Button onClick={onClose}>
                  Попробовать снова
                </Button>
              </>
            )}
          </div>
        )}

        {/* Оверлей блокировки */}
        {isBlocked && gameState === 'playing' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-10">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">🛡️</div>
              <p className="text-lg font-bold">Игра заблокирована</p>
              <p className="text-sm text-gray-300">Обнаружена подозрительная активность</p>
              <Button 
                onClick={onClose} 
                className="mt-4"
                variant="outline"
              >
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

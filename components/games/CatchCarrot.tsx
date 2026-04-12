"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const AD_URL = "https://www.profitablecpmratenetwork.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005"

interface Carrot {
  id: number
  x: number
  y: number
  speed: number
}

interface CatchCarrotProps {
  onClose: () => void
  onReward: (multiplier: number, duration: number) => void
}

export default function CatchCarrot({ onClose, onReward }: CatchCarrotProps) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [carrots, setCarrots] = useState<Carrot[]>([])
  const [showResult, setShowResult] = useState(false)
  const [doubleReward, setDoubleReward] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const carrotIdRef = useRef(0)

  // Spawn carrots
  useEffect(() => {
    if (gameState !== "playing") return

    const spawnInterval = setInterval(() => {
      const newCarrot: Carrot = {
        id: carrotIdRef.current++,
        x: Math.random() * 85 + 5, // 5-90%
        y: -10,
        speed: 2 + Math.random() * 3,
      }
      setCarrots((prev) => [...prev, newCarrot])
    }, 400)

    return () => clearInterval(spawnInterval)
  }, [gameState])

  // Move carrots down
  useEffect(() => {
    if (gameState !== "playing") return

    const moveInterval = setInterval(() => {
      setCarrots((prev) =>
        prev
          .map((c) => ({ ...c, y: c.y + c.speed }))
          .filter((c) => c.y < 110) // Remove off-screen
      )
    }, 50)

    return () => clearInterval(moveInterval)
  }, [gameState])

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("finished")
          setShowResult(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  const catchCarrot = useCallback((id: number) => {
    setCarrots((prev) => prev.filter((c) => c.id !== id))
    setScore((prev) => prev + 1)
  }, [])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(20)
    setCarrots([])
  }

  const getRewardMultiplier = () => {
    if (score >= 80) return 3
    if (score >= 50) return 2
    return 1
  }

  const claimReward = () => {
    const multiplier = getRewardMultiplier() * (doubleReward ? 2 : 1)
    onReward(multiplier, 10) // 10 minutes
    onClose()
  }

  const watchAdForDouble = () => {
    window.open(AD_URL, "_blank")
    // After ad, set double reward
    setTimeout(() => {
      setDoubleReward(true)
    }, 3000)
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-purple-900/50 to-transparent">
        <Button variant="ghost" onClick={onClose} className="text-white">
          Закрыть
        </Button>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">{score}</p>
          <p className="text-xs text-gray-400">очков</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{timeLeft}</p>
          <p className="text-xs text-gray-400">сек</p>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-b from-blue-900/30 to-purple-900/30"
      >
        {gameState === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Поймай Морковку!</h2>
            <p className="text-gray-300 text-center text-sm">
              Нажимай на падающие морковки за 20 секунд
            </p>
            <div className="space-y-2 text-center text-sm">
              <p className="text-orange-400">50+ очков = x2 доход на 10 мин</p>
              <p className="text-yellow-400">80+ очков = x3 доход на 10 мин</p>
            </div>
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold text-lg px-8 py-4 h-auto mt-4"
            >
              Начать игру
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <>
            {carrots.map((carrot) => (
              <button
                key={carrot.id}
                onClick={() => catchCarrot(carrot.id)}
                className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform active:scale-90 cursor-pointer select-none"
                style={{
                  left: `${carrot.x}%`,
                  top: `${carrot.y}%`,
                }}
              >
                🥕
              </button>
            ))}
          </>
        )}
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-black/95 backdrop-blur-md border-yellow-500/50 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {score >= 50 ? "Отлично!" : "Игра окончена"}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Вы поймали {score} морковок
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <div className="text-6xl">{score >= 80 ? "🏆" : score >= 50 ? "⭐" : "🥕"}</div>
            <p className="text-xl font-bold text-yellow-400">
              {score >= 80 ? "x3 доход на 10 минут!" : score >= 50 ? "x2 доход на 10 минут!" : "Попробуйте ещё раз"}
            </p>
            
            {score >= 50 && !doubleReward && (
              <Button
                onClick={watchAdForDouble}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
              >
                Смотреть рекламу = УДВОИТЬ награду
              </Button>
            )}

            {doubleReward && (
              <p className="text-green-400 font-bold">Награда удвоена!</p>
            )}

            <Button
              onClick={claimReward}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold"
            >
              Забрать {doubleReward ? "(x2)" : ""} награду
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

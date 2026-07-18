"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const AD_URL = "https://www.profitablecpmratenetwork.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005"

interface BossBattleProps {
  onClose: () => void
  onVictory: (reward: "chest" | "boost", boostMinutes?: number) => void
  onDefeat: () => void
}

export default function BossBattle({ onClose, onVictory, onDefeat }: BossBattleProps) {
  const [gameState, setGameState] = useState<"intro" | "fighting" | "victory" | "defeat" | "continued">("intro")
  const [bossHP, setBossHP] = useState(1000) // 500-2000 taps needed
  const [maxBossHP] = useState(1000)
  const [timeLeft, setTimeLeft] = useState(30)
  const [taps, setTaps] = useState(0)
  const [showContinue, setShowContinue] = useState(false)
  const [bossShake, setBossShake] = useState(false)

  // Timer
  useEffect(() => {
    if (gameState !== "fighting" && gameState !== "continued") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (bossHP > 0) {
            setGameState("defeat")
            setShowContinue(true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, bossHP])

  // Check victory
  useEffect(() => {
    if (bossHP <= 0 && gameState === "fighting") {
      setGameState("victory")
    }
  }, [bossHP, gameState])

  const startFight = () => {
    setGameState("fighting")
    setTimeLeft(30)
    setTaps(0)
    setBossHP(maxBossHP)
  }

  const tapBoss = useCallback(() => {
    if (gameState !== "fighting" && gameState !== "continued") return
    
    setTaps((prev) => prev + 1)
    setBossHP((prev) => Math.max(0, prev - 1))
    setBossShake(true)
    setTimeout(() => setBossShake(false), 100)
  }, [gameState])

  const watchAdToContinue = () => {
    window.open(AD_URL, "_blank")
    setTimeout(() => {
      setShowContinue(false)
      setGameState("continued")
      setTimeLeft(15) // 15 more seconds
    }, 3000)
  }

  const claimVictory = () => {
    // Random reward: chest or x3 boost
    const reward = Math.random() > 0.5 ? "chest" : "boost"
    onVictory(reward, 30)
    onClose()
  }

  const hpPercent = (bossHP / maxBossHP) * 100

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-b from-red-900/50 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
            Убежать
          </Button>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{timeLeft}</p>
            <p className="text-xs text-gray-400">секунд</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-400">{taps}</p>
            <p className="text-xs text-gray-400">тапов</p>
          </div>
        </div>
        
        {/* Boss HP bar */}
        {(gameState === "fighting" || gameState === "continued") && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Мега-Хомяк</span>
              <span>{bossHP}/{maxBossHP} HP</span>
            </div>
            <Progress 
              value={hpPercent} 
              className="h-4 bg-gray-800"
            />
          </div>
        )}
      </div>

      {/* Boss Area */}
      <div 
        className="flex-1 flex flex-col items-center justify-center gap-6 p-4"
        onClick={tapBoss}
      >
        {gameState === "intro" && (
          <div className="text-center space-y-4">
            <div className="text-8xl animate-bounce">🐹</div>
            <h2 className="text-2xl font-bold text-white">МЕГА-ХОМЯК появился!</h2>
            <p className="text-gray-300 text-sm">
              30 секунд чтобы победить!<br/>
              Тапай как можно быстрее!
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-400">Награда: Огромный сундук</p>
              <p className="text-purple-400">Или: x3 доход на 30 минут</p>
            </div>
            <Button
              onClick={startFight}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xl px-12 py-6 h-auto mt-4"
            >
              В БОЙ!
            </Button>
          </div>
        )}

        {(gameState === "fighting" || gameState === "continued") && (
          <div className="text-center select-none">
            <div 
              className={`text-[150px] leading-none transition-transform cursor-pointer active:scale-90 ${bossShake ? "animate-pulse scale-95" : ""}`}
            >
              🐹
            </div>
            <p className="text-gray-400 mt-4 text-sm">ТАПАЙ ПО ХОМЯКУ!</p>
          </div>
        )}

        {gameState === "victory" && (
          <div className="text-center space-y-4">
            <div className="text-8xl">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-400">ПОБЕДА!</h2>
            <p className="text-white">Ты победил за {taps} тапов!</p>
            <Button
              onClick={claimVictory}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg px-8 py-4 h-auto"
            >
              Забрать награду
            </Button>
          </div>
        )}
      </div>

      {/* Continue Dialog */}
      <Dialog open={showContinue} onOpenChange={setShowContinue}>
        <DialogContent onOpenChange={setShowContinue} className="bg-black/95 backdrop-blur-md border-red-500/50 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-red-400">
              Время вышло!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Осталось {bossHP} HP у босса
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <div className="text-6xl">😵</div>
            <p className="text-gray-300">Хомяк победил... пока что</p>
            
            <Button
              onClick={watchAdToContinue}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
            >
              Смотреть рекламу = +15 секунд
            </Button>
            
            <Button
              onClick={() => { onDefeat(); onClose(); }}
              variant="ghost"
              className="w-full text-gray-400"
            >
              Сдаться
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

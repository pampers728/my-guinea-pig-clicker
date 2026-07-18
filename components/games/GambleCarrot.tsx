"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const AD_URL = "https://www.profitablecpmratenetwork.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005"

interface GambleCarrotProps {
  carrots: number
  freeGambleUsed: boolean
  onGamble: (bet: number, result: number, won: boolean) => void
  onUseFreeGamble: () => void
  onClose: () => void
}

// 40% loss, 35% x2, 20% x3, 5% x5
function rollGamble(): { multiplier: number; label: string } {
  const roll = Math.random() * 100
  if (roll < 40) return { multiplier: 0, label: "Проигрыш" }
  if (roll < 75) return { multiplier: 2, label: "x2" }
  if (roll < 95) return { multiplier: 3, label: "x3" }
  return { multiplier: 5, label: "x5" }
}

export default function GambleCarrot({ carrots, freeGambleUsed, onGamble, onUseFreeGamble, onClose }: GambleCarrotProps) {
  const [bet, setBet] = useState(100)
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<{ multiplier: number; label: string; winAmount: number } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [canPlayAgain, setCanPlayAgain] = useState(!freeGambleUsed)

  const maxBet = Math.min(carrots, 250000)

  const play = () => {
    if (bet > carrots || bet <= 0) return
    
    setIsRolling(true)
    
    // Animation delay
    setTimeout(() => {
      const outcome = rollGamble()
      const winAmount = outcome.multiplier > 0 ? bet * outcome.multiplier : 0
      setResult({ ...outcome, winAmount })
      setShowResult(true)
      setIsRolling(false)
      onGamble(bet, winAmount, outcome.multiplier > 0)
      
      if (canPlayAgain && !freeGambleUsed) {
        onUseFreeGamble()
        setCanPlayAgain(false)
      }
    }, 1500)
  }

  const watchAdToPlayAgain = () => {
    window.open(AD_URL, "_blank")
    setTimeout(() => {
      setCanPlayAgain(true)
      setShowResult(false)
      setResult(null)
    }, 3000)
  }

  const quickBets = [100, 1000, 10000, 50000, 100000]

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-gradient-to-b from-purple-900/50 to-black border-purple-500/30 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Рискни морковкой!</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
            ✕
          </Button>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">У вас</p>
          <p className="text-2xl font-bold text-orange-400">{carrots.toLocaleString()} 🥕</p>
        </div>

        {/* Probabilities */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs">
          <div className="bg-red-900/30 rounded p-2">
            <p className="text-red-400">40%</p>
            <p className="text-gray-400">Проигрыш</p>
          </div>
          <div className="bg-green-900/30 rounded p-2">
            <p className="text-green-400">35%</p>
            <p className="text-gray-400">x2</p>
          </div>
          <div className="bg-blue-900/30 rounded p-2">
            <p className="text-blue-400">20%</p>
            <p className="text-gray-400">x3</p>
          </div>
          <div className="bg-yellow-900/30 rounded p-2">
            <p className="text-yellow-400">5%</p>
            <p className="text-gray-400">x5</p>
          </div>
        </div>

        {/* Bet input */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <Input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.min(Number(e.target.value), maxBet))}
              className="bg-black/50 border-purple-500/30 text-white text-lg text-center"
              min={1}
              max={maxBet}
            />
            <Button
              onClick={() => setBet(maxBet)}
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 shrink-0"
            >
              MAX
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {quickBets.map((amount) => (
              <Button
                key={amount}
                size="sm"
                variant="outline"
                disabled={amount > carrots}
                onClick={() => setBet(Math.min(amount, maxBet))}
                className="text-xs border-gray-600 text-gray-300 disabled:opacity-30"
              >
                {amount >= 1000 ? `${amount / 1000}K` : amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <Button
          onClick={play}
          disabled={isRolling || bet > carrots || bet <= 0 || (!canPlayAgain && result !== null)}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg py-6 h-auto disabled:opacity-40"
        >
          {isRolling ? (
            <span className="animate-pulse">Крутим...</span>
          ) : canPlayAgain || result === null ? (
            `Рискнуть ${bet.toLocaleString()} 🥕`
          ) : (
            "Смотреть рекламу для повторной игры"
          )}
        </Button>

        {!canPlayAgain && result !== null && (
          <Button
            onClick={watchAdToPlayAgain}
            className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
          >
            Смотреть рекламу = играть ещё
          </Button>
        )}

        {!freeGambleUsed && (
          <p className="text-center text-xs text-green-400 mt-3">
            1 бесплатная попытка в день!
          </p>
        )}
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent onOpenChange={setShowResult} className="bg-black/95 backdrop-blur-md border-yellow-500/50 text-white max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {result?.multiplier === 0 ? "Проигрыш!" : "Победа!"}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              {result?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-3 py-4">
            <div className="text-6xl">
              {result?.multiplier === 0 ? "😢" : result?.multiplier === 5 ? "🎉" : "🎊"}
            </div>
            <p className="text-xl font-bold">
              {result?.multiplier === 0 ? (
                <span className="text-red-400">-{bet.toLocaleString()} 🥕</span>
              ) : (
                <span className="text-green-400">+{result?.winAmount.toLocaleString()} 🥕</span>
              )}
            </p>
          </div>
          <Button
            onClick={() => setShowResult(false)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Продолжить
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

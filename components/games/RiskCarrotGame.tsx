"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface RiskCarrotGameProps {
  onReward: (amount: number) => void
  onLoss: (amount: number) => void
  onClose: () => void
  isOpen: boolean
  currentCarrots: number
  hasFreeSpin: boolean
  onUseFreeSpin: () => void
}

export function RiskCarrotGame({ 
  onReward, 
  onLoss, 
  onClose, 
  isOpen, 
  currentCarrots,
  hasFreeSpin,
  onUseFreeSpin
}: RiskCarrotGameProps) {
  const [betAmount, setBetAmount] = useState(100)
  const [gameState, setGameState] = useState<'betting' | 'spinning' | 'result'>('betting')
  const [result, setResult] = useState<{ type: 'loss' | 'win', multiplier: number, amount: number } | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)

  const maxBet = Math.min(250000, currentCarrots)

  const outcomes = [
    { type: 'loss' as const, probability: 40, multiplier: 0, emoji: '❌', label: 'Проигрыш' },
    { type: 'win' as const, probability: 35, multiplier: 2, emoji: '💰', label: 'x2' },
    { type: 'win' as const, probability: 20, multiplier: 3, emoji: '💎', label: 'x3' },
    { type: 'win' as const, probability: 5, multiplier: 5, emoji: '🚀', label: 'x5' },
  ]

  const spinWheel = () => {
    if (betAmount > currentCarrots && !hasFreeSpin) return
    if (betAmount < 1) return

    setGameState('spinning')
    setShowAnimation(true)

    // Simulate spinning animation
    setTimeout(() => {
      const random = Math.random() * 100
      let cumulative = 0
      let selectedOutcome = outcomes[0]

      for (const outcome of outcomes) {
        cumulative += outcome.probability
        if (random <= cumulative) {
          selectedOutcome = outcome
          break
        }
      }

      const finalAmount = selectedOutcome.type === 'win' 
        ? betAmount * selectedOutcome.multiplier 
        : 0

      setResult({
        type: selectedOutcome.type,
        multiplier: selectedOutcome.multiplier,
        amount: finalAmount
      })

      setShowAnimation(false)
      setGameState('result')

      // Apply the result
      if (selectedOutcome.type === 'win') {
        onReward(finalAmount - betAmount) // Net gain
      } else {
        onLoss(betAmount)
      }

      if (hasFreeSpin) {
        onUseFreeSpin()
      }
    }, 3000)
  }

  const resetGame = () => {
    setGameState('betting')
    setResult(null)
    setBetAmount(100)
  }

  const watchAdForSpin = () => {
    // Implement ad watching logic
    spinWheel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-purple-900/90 to-red-900/90 border-purple-500/50">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-white">
            🎲 Рискни морковкой
          </DialogTitle>
        </DialogHeader>

        {gameState === 'betting' && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎰</div>
              <p className="text-white mb-4">
                Выберите сумму ставки и рискните!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Ставка (морковки):</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Math.min(maxBet, parseInt(e.target.value) || 0)))}
                max={maxBet}
                min={1}
                className="text-center text-lg"
              />
              <p className="text-xs text-gray-400 text-center">
                Максимум: {maxBet.toLocaleString()} морковок
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {outcomes.map((outcome, index) => (
                <div key={index} className="bg-black/20 rounded p-2 text-center">
                  <div className="text-lg">{outcome.emoji}</div>
                  <div className="text-white">{outcome.label}</div>
                  <div className="text-gray-400">{outcome.probability}%</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {hasFreeSpin ? (
                <Button onClick={spinWheel} className="w-full bg-green-600 hover:bg-green-700">
                  🎁 Бесплатная попытка
                </Button>
              ) : betAmount <= currentCarrots ? (
                <Button onClick={spinWheel} className="w-full bg-purple-600 hover:bg-purple-700">
                  Рискнуть {betAmount.toLocaleString()} 🥕
                </Button>
              ) : (
                <Button disabled className="w-full">
                  Недостаточно морковок
                </Button>
              )}
              
              {!hasFreeSpin && (
                <Button 
                  onClick={watchAdForSpin} 
                  variant="outline" 
                  className="w-full"
                >
                  📺 Реклама → Бесплатная попытка
                </Button>
              )}
            </div>
          </div>
        )}

        {gameState === 'spinning' && (
          <div className="text-center space-y-4 py-8">
            <div className={`text-8xl transition-transform duration-300 ${showAnimation ? 'animate-spin' : ''}`}>
              🎰
            </div>
            <p className="text-white text-lg">
              Крутится колесо удачи...
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {gameState === 'result' && result && (
          <div className="text-center space-y-4 py-4">
            <div className="text-8xl">
              {result.type === 'win' ? '🎉' : '💔'}
            </div>
            <h3 className="text-xl font-bold text-white">
              {result.type === 'win' ? 'Поздравляем!' : 'Не повезло...'}
            </h3>
            
            {result.type === 'win' ? (
              <div className="space-y-2">
                <p className="text-lg text-green-400">
                  x{result.multiplier} → {result.amount.toLocaleString()} 🥕
                </p>
                <p className="text-sm text-gray-300">
                  Чистая прибыль: +{(result.amount - betAmount).toLocaleString()} 🥕
                </p>
              </div>
            ) : (
              <p className="text-lg text-red-400">
                Потеряно: {betAmount.toLocaleString()} 🥕
              </p>
            )}

            <div className="space-y-2">
              <Button onClick={resetGame} className="w-full">
                Играть снова
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

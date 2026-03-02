"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CatchCarrotGame } from "./CatchCarrotGame"
import { RiskCarrotGame } from "./RiskCarrotGame"
import { BossFightGame } from "./BossFightGame"

interface GameCenterProps {
  carrots: number
  onCarrotChange: (amount: number) => void
  onMultiplierBoost: (multiplier: number, duration: number) => void
  onChestReward: (amount: number) => void
}

export function GameCenter({ 
  carrots, 
  onCarrotChange, 
  onMultiplierBoost, 
  onChestReward 
}: GameCenterProps) {
  const [activeGame, setActiveGame] = useState<'catch' | 'risk' | 'boss' | null>(null)
  const [hasFreeSpin, setHasFreeSpin] = useState(true)
  const [nextBossTime, setNextBossTime] =useState<Date | null>(null)

  const handleCatchReward = (multiplier: number, duration: number) => {
    onMultiplierBoost(multiplier, duration)
  }

  const handleRiskReward = (amount: number) => {
    onCarrotChange(amount)
  }

  const handleRiskLoss = (amount: number) => {
    onCarrotChange(-amount)
  }

  const handleBossReward = (type: 'chest' | 'multiplier', value: number, duration?: number) => {
    if (type === 'chest') {
      onChestReward(value)
    } else if (type === 'multiplier' && duration) {
      onMultiplierBoost(value, duration)
    }
  }

  const handleBossDefeated = () => {
    // Set next boss time to 3 hours from now
    const nextTime = new Date()
    nextTime.setHours(nextTime.getHours() + 3)
    setNextBossTime(nextTime)
  }

  const handleUseFreeSpin = () => {
    setHasFreeSpin(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white text-center">🎮 Игровой центр</h2>
      
      <div className="grid gap-4">
        {/* Catch the Carrot */}
        <Card className="p-4 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🥕</div>
              <div>
                <h3 className="font-bold text-white">Catch the Carrot</h3>
                <p className="text-sm text-gray-300">Ловите морковки за 20 секунд</p>
              </div>
            </div>
            <Button 
              onClick={() => setActiveGame('catch')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Играть
            </Button>
          </div>
        </Card>

        {/* Risk Carrot */}
        <Card className="p-4 bg-gradient-to-r from-purple-900/20 to-red-900/20 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎲</div>
              <div>
                <h3 className="font-bold text-white">Рискни морковкой</h3>
                <p className="text-sm text-gray-300">Азартная игра с большими призами</p>
                {hasFreeSpin && (
                  <Badge className="mt-1 bg-green-600">Бесплатная попытка</Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={() => setActiveGame('risk')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Играть
            </Button>
          </div>
        </Card>

        {/* Boss Fight */}
        <Card className="p-4 bg-gradient-to-r from-red-900/20 to-black/20 border-red-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">👹</div>
              <div>
                <h3 className="font-bold text-white">Мега-хомяк Босс</h3>
                <p className="text-sm text-gray-300">Эпический босс каждые 3 часа</p>
                {nextBossTime && new Date() < nextBossTime && (
                  <Badge variant="secondary" className="mt-1">
                    Восстанавливается...
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={() => setActiveGame('boss')}
              className="bg-red-600 hover:bg-red-700"
              disabled={nextBossTime ? new Date() < nextBossTime : false}
            >
              {nextBossTime && new Date() < nextBossTime ? 'Ждите' : 'Сражаться'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Game Modals */}
      <CatchCarrotGame
        isOpen={activeGame === 'catch'}
        onClose={() => setActiveGame(null)}
        onReward={handleCatchReward}
      />

      <RiskCarrotGame
        isOpen={activeGame === 'risk'}
        onClose={() => setActiveGame(null)}
        onReward={handleRiskReward}
        onLoss={handleRiskLoss}
        currentCarrots={carrots}
        hasFreeSpin={hasFreeSpin}
        onUseFreeSpin={handleUseFreeSpin}
      />

      <BossFightGame
        isOpen={activeGame === 'boss'}
        onClose={() => setActiveGame(null)}
        onReward={handleBossReward}
        nextBossTime={nextBossTime}
        onBossDefeated={handleBossDefeated}
      />
    </div>
  )
}

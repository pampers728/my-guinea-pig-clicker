"use client"

import { useState, useEffect } from "react"
import { GameCenter } from "@/components/games/GameCenter"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function GamesPage() {
  const [gameStats, setGameStats] = useState({
    carrots: 1000,
    gt: 0,
    totalGamesPlayed: 0,
    bestCatchScore: 0
  })

  const handleCarrotChange = (amount: number) => {
    setGameStats(prev => ({
      ...prev,
      carrots: Math.max(0, prev.carrots + amount)
    }))
  }

  const handleMultiplierBoost = (multiplier: number, duration: number) => {
    // Implement multiplier logic
    console.log(`🚀 Активирован множитель x${multiplier} на ${duration} минут`)
  }

  const handleChestReward = (amount: number) => {
    setGameStats(prev => ({
      ...prev,
      gt: prev.gt + amount
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header with back button */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">🎮 Игровой центр</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-orange-900/20 rounded p-3 border border-orange-500/30">
              <div className="text-2xl">🥕</div>
              <div className="text-white font-bold">{gameStats.carrots.toLocaleString()}</div>
              <div className="text-xs text-gray-300">Морковки</div>
            </div>
            <div className="bg-purple-900/20 rounded p-3 border border-purple-500/30">
              <div className="text-2xl">💎</div>
              <div className="text-white font-bold">{gameStats.gt.toLocaleString()}</div>
              <div className="text-xs text-gray-300">GT</div>
            </div>
          </div>
        </Card>

        {/* Games */}
        <GameCenter
          carrots={gameStats.carrots}
          onCarrotChange={handleCarrotChange}
          onMultiplierBoost={handleMultiplierBoost}
          onChestReward={handleChestReward}
        />

        {/* Game Statistics */}
        <Card className="p-4">
          <h3 className="text-white font-bold mb-3">📊 Статистика игр</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Всего игр сыграно:</span>
              <span className="text-white">{gameStats.totalGamesPlayed}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Лучший результат (Catch):</span>
              <span className="text-white">{gameStats.bestCatchScore}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface BossFightGameProps {
  onReward: (type: 'chest' | 'multiplier', value: number, duration?: number) => void
  onClose: () => void
  isOpen: boolean
  nextBossTime: Date | null
  onBossDefeated: () => void
}

export function BossFightGame({ 
  onReward, 
  onClose, 
  isOpen, 
  nextBossTime,
  onBossDefeated
}: BossFightGameProps) {
  const [gameState, setGameState] = useState<'waiting' | 'fighting' | 'victory' | 'defeat'>('waiting')
  const [bossHp, setBossHp] = useState(2000)
  const [maxBossHp] = useState(2000)
  const [timeLeft, setTimeLeft] = useState(30)
  const [taps, setTaps] = useState(0)
  const [requiredTaps] = useState(500 + Math.floor(Math.random() * 1500)) // 500-2000
  const [showReward, setShowReward] = useState(false)
  const [bossAnimation, setBossAnimation] = useState('')
  
  const bossRef = useRef<HTMLDivElement>(null)

  const canFight = nextBossTime ? new Date() >= nextBossTime : true

  const startFight = () => {
    setGameState('fighting')
    setBossHp(maxBossHp)
    setTimeLeft(30)
    setTaps(0)
  }

  const tapBoss = () => {
    if (gameState !== 'fighting') return
    
    setTaps(prev => prev + 1)
    setBossHp(prev => {
      const damage = Math.floor(maxBossHp / requiredTaps)
      const newHp = Math.max(0, prev - damage)
      
      if (newHp <= 0) {
        setGameState('victory')
        setShowReward(true)
        onBossDefeated()
      }
      
      return newHp
    })

    // Boss hit animation
    setBossAnimation('animate-pulse')
    setTimeout(() => setBossAnimation(''), 200)
  }

  const claimReward = (rewardType: 'chest' | 'multiplier') => {
    if (rewardType === 'chest') {
      const chestValue = 1000 + Math.floor(Math.random() * 4000) // 1000-5000 GT
      onReward('chest', chestValue)
    } else {
      onReward('multiplier', 3, 30) // x3 на 30 минут
    }
    setShowReward(false)
    onClose()
  }

  const continueWithAd = () => {
    // Reset timer and continue fight
    setTimeLeft(30)
    setGameState('fighting')
  }

  // Timer
  useEffect(() => {
    if (gameState !== 'fighting') return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('defeat')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameState])

  const timeUntilBoss = nextBossTime ? Math.max(0, nextBossTime.getTime() - new Date().getTime()) : 0
  const hoursUntilBoss = Math.floor(timeUntilBoss / (1000 * 60 * 60))
  const minutesUntilBoss = Math.floor((timeUntilBoss % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-red-900/90 to-black/90 border-red-500/50">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-white">
            👹 Мега-хомяк Босс
          </DialogTitle>
        </DialogHeader>

        {!canFight && (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">⏰</div>
            <h3 className="text-xl font-bold text-white">
              Босс восстанавливается...
            </h3>
            <p className="text-gray-300">
              Следующий босс через: {hoursUntilBoss}ч {minutesUntilBoss}м
            </p>
            <Button onClick={onClose}>
              Закрыть
            </Button>
          </div>
        )}

        {canFight && gameState === 'waiting' && (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">👹</div>
            <h3 className="text-xl font-bold text-white">
              Мега-хомяк появился!
            </h3>
            <p className="text-gray-300">
              У вас есть 30 секунд, чтобы нанести {requiredTaps} ударов!
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>🏆 Победа → Огромный сундук ил�� x3 доход</p>
              <p>📺 Поражение → Реклама для продолжения</p>
            </div>
            <Button onClick={startFight} size="lg" className="bg-red-600 hover:bg-red-700">
              Атаковать босса!
            </Button>
          </div>
        )}

        {gameState === 'fighting' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="destructive" className="text-lg">
                Время: {timeLeft}с
              </Badge>
              <Badge variant="secondary" className="text-lg">
                Удары: {taps}/{requiredTaps}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>HP Босса</span>
                <span>{bossHp}/{maxBossHp}</span>
              </div>
              <Progress value={(bossHp / maxBossHp) * 100} className="h-3" />
            </div>

            <div className="text-center">
              <div 
                ref={bossRef}
                className={`text-8xl cursor-pointer select-none transition-transform hover:scale-110 active:scale-95 ${bossAnimation}`}
                onClick={tapBoss}
              >
                👹
              </div>
              <p className="text-white mt-2">
                Кликайте по боссу!
              </p>
            </div>

            <div className="text-center">
              <Progress value={(taps / requiredTaps) * 100} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                Прогресс атаки: {Math.round((taps / requiredTaps) * 100)}%
              </p>
            </div>
          </div>
        )}

        {gameState === 'victory' && showReward && (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">🏆</div>
            <h3 className="text-xl font-bold text-white">
              Победа!
            </h3>
            <p className="text-green-400">
              Мега-хомяк повержен за {taps} ударов!
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => claimReward('chest')} 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                📦 Огромный сундук
              </Button>
              <Button 
                onClick={() => claimReward('multiplier')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                ⚡ x3 доход на 30 минут
              </Button>
            </div>
          </div>
        )}

        {gameState === 'defeat' && (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">💀</div>
            <h3 className="text-xl font-bold text-white">
              Время вышло!
            </h3>
            <p className="text-red-400">
              Нанесено ударов: {taps}/{requiredTaps}
            </p>
            <p className="text-gray-300">
              Босс слишком силен...
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={continueWithAd} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                📺 Реклама → Продолжить бой
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                Отступить
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

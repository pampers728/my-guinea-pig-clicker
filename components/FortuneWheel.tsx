"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFortuneWheel } from "@/hooks/useFortuneWheel"
import { WheelPrize } from "@/types/rewards"

// Prize definitions с типизацией
const PRIZES: WheelPrize[] = [
  { id: 1, label: "+50-500 🥕", color: "#f97316", type: "carrots", min: 50, max: 500, prob: 25 },
  { id: 2, label: "+500-2500 🥕", color: "#ea580c", type: "carrots", min: 500, max: 2500, prob: 25 },
  { id: 3, label: "+100 Energy", color: "#22c55e", type: "energy", min: 100, max: 300, prob: 13 },
  { id: 4, label: "+300-1000 Energy", color: "#16a34a", type: "energy", min: 300, max: 1000, prob: 12 },
  { id: 5, label: "Auto-tap 30m", color: "#8b5cf6", type: "autotap", duration: 30, prob: 5 },
  { id: 6, label: "Auto-tap 60m", color: "#7c3aed", type: "autotap", duration: 60, prob: 2 },
  { id: 7, label: "x2 Boost 30m", color: "#ec4899", type: "booster", duration: 30, prob: 7 },
  { id: 8, label: "x2 Boost 60m", color: "#db2777", type: "booster", duration: 60, prob: 3 },
  { id: 9, label: "+0.01 GT", color: "#eab308", type: "gt", min: 0.01, max: 0.03, prob: 5 },
  { id: 10, label: "+0.05-0.1 GT", color: "#ca8a04", type: "gt", min: 0.05, max: 0.1, prob: 3 },
]

interface FortuneWheelProps {
  userId: string
  onPrize: (prize: WheelPrize, value: number) => void
}

function weightedRandom(): WheelPrize {
  const totalProb = PRIZES.reduce((s, p) => s + p.prob, 0)
  let r = Math.random() * totalProb
  for (const prize of PRIZES) {
    r -= prize.prob
    if (r <= 0) return prize
  }
  return PRIZES[0]
}

export function FortuneWheel({ userId, onPrize }: FortuneWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null)
  const [wonAmount, setWonAmount] = useState(0)
  
  const {
    loading,
    canSpin,
    spinsLeft,
    validateAdWatch,
    claimPrize,
    checkDailyLimits
  } = useFortuneWheel({ userId, onPrize })

  useEffect(() => {
    checkDailyLimits()
  }, [checkDailyLimits])

  const handleSpin = async () => {
    if (!canSpin || spinning || loading) return

    // 1. Сначала валидируем просмотр рекламы
    const isValidated = await validateAdWatch()
    if (!isValidated) return

    setSpinning(true)

    try {
      // 2. Выбираем случайный приз
      const selectedPrize = weightedRandom()
      
      // 3. Отправляем запрос на получение награды
      const claimedPrize = await claimPrize(selectedPrize.id)
      
      // 4. Показываем результат
      setWonPrize(claimedPrize)
      setWonAmount(claimedPrize.amount || 0)
      
      // Имитируем вращение колеса
      setTimeout(() => {
        setSpinning(false)
        setShowResult(true)
      }, 3000)

    } catch (error) {
      console.error('Spin error:', error)
      setSpinning(false)
      alert('Ошибка при получении награды: ' + error)
    }
  }

  const closeResult = () => {
    setShowResult(false)
    setWonPrize(null)
    setWonAmount(0)
  }

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">🎰 Колесо Фортуны</h3>
          <p className="text-gray-300">
            Осталось вращений сегодня: <span className="font-bold text-yellow-400">{spinsLeft}</span>
          </p>
          
          {/* Простое представление колеса */}
          <div className={`mx-auto w-48 h-48 rounded-full border-4 border-yellow-400 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center text-6xl transition-transform duration-3000 ${spinning ? 'animate-spin' : ''}`}>
            🎯
          </div>

          <Button
            onClick={handleSpin}
            disabled={!canSpin || spinning || loading}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {spinning ? 'Крутится...' : 
             loading ? 'Загрузка...' : 
             !canSpin ? 'Лимит исчерпан' : 
             'Крутить колесо'}
          </Button>

          {!canSpin && (
            <p className="text-sm text-red-400">
              Вы достигли дневного лимита. Попробуйте завтра!
            </p>
          )}
        </div>
      </Card>

      {/* Диалог с результатом */}
      <Dialog open={showResult} onOpenChange={closeResult}>
        <DialogContent className="bg-gradient-to-br from-green-900/90 to-blue-900/90 border-green-500/50">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-white">
              🎉 Поздравляем!
            </DialogTitle>
          </DialogHeader>
          
          {wonPrize && (
            <div className="text-center space-y-4 py-4">
              <div className="text-6xl">{wonPrize.label.split(' ')[1]}</div>
              <h3 className="text-xl font-bold text-white">
                Вы выиграли: {wonPrize.label}
              </h3>
              {wonAmount > 0 && (
                <p className="text-lg text-green-400">
                  Количество: {wonAmount}
                </p>
              )}
              <Button onClick={closeResult} className="mt-4">
                Отлично!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

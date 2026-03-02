"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAntiCheat } from "@/hooks/useAntiCheat"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("clicker")
  const [carrots, setCarrots] = useState(0)
  const [gt, setGt] = useState(0)
  const [energy, setEnergy] = useState(1000)
  const [maxEnergy, setMaxEnergy] = useState(1000)
  const [totalClicks, setTotalClicks] = useState(0)
  const [totalClickBonus, setTotalClickBonus] = useState(0)
  const [autoTapActive, setAutoTapActive] = useState(false)
  const [autoTapInterval, setAutoTapInterval] = useState<NodeJS.Timeout | null>(null)
  const [autoTapEndTime, setAutoTapEndTime] = useState(0)
  const [boosterActive, setBoosterActive] = useState(false)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [totalIncomePerHour, setTotalIncomePerHour] = useState(0)
  const [carrotsPerClickLevel, setCarrotsPerClickLevel] = useState(1)
  const [maxEnergyLevel, setMaxEnergyLevel] = useState(1)
  const [referralBonus, setReferralBonus] = useState(0)
  const [referralsCount, setReferralsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [unlockedPigs, setUnlockedPigs] = useState(0)
  const [activePigId, setActivePigId] = useState<number | null>(null)
  const [playerMiners, setPlayerMiners] = useState(0)
  const [guineaTokens, setGuineaTokens] = useState(0)
  const [telegramStars, setTelegramStars] = useState(0)
  const [sessionStart] = useState(Date.now())

  const { isBlocked, validateClick, validateProgress, warnings } = useAntiCheat()

  // Save to localStorage on every state change (instant persistence)
  useEffect(() => {
    localStorage.setItem("carrots", carrots.toString())
    localStorage.setItem("gt", gt.toString())
    localStorage.setItem("energy", energy.toString())
    localStorage.setItem("maxEnergy", maxEnergy.toString())
    localStorage.setItem("totalClicks", totalClicks.toString())
    localStorage.setItem("totalClickBonus", totalClickBonus.toString())
    localStorage.setItem("autoTapActive", autoTapActive.toString())
    localStorage.setItem("autoTapInterval", autoTapInterval?.toString() || "null")
    localStorage.setItem("autoTapEndTime", autoTapEndTime.toString())
    localStorage.setItem("boosterActive", boosterActive.toString())
    localStorage.setItem("level", level.toString())
    localStorage.setItem("xp", xp.toString())
    localStorage.setItem("totalIncomePerHour", totalIncomePerHour.toString())
    localStorage.setItem("carrotsPerClickLevel", carrotsPerClickLevel.toString())
    localStorage.setItem("maxEnergyLevel", maxEnergyLevel.toString())
    localStorage.setItem("referralBonus", referralBonus.toString())
    localStorage.setItem("referralsCount", referralsCount.toString())
    localStorage.setItem("isLoading", isLoading.toString())
    localStorage.setItem("unlockedPigs", unlockedPigs.toString())
    localStorage.setItem("activePigId", activePigId?.toString() || "null")
    localStorage.setItem("playerMiners", playerMiners.toString())
    localStorage.setItem("guineaTokens", guineaTokens.toString())
    localStorage.setItem("telegramStars", telegramStars.toString())
  }, [carrots, gt, energy, maxEnergy, totalClicks, totalClickBonus, autoTapActive, autoTapInterval, autoTapEndTime, boosterActive, level, xp, totalIncomePerHour, carrotsPerClickLevel, maxEnergyLevel, referralBonus, referralsCount, isLoading, unlockedPigs, activePigId, playerMiners, guineaTokens, telegramStars])

  // Auto-save to server every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() >= autoTapEndTime) {
        setAutoTapActive(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [autoTapEndTime])

  // Модифицируем функцию клика с защитой
  const handleMainClick = (event: React.MouseEvent) => {
    if (isBlocked) {
      // Показываем уведомление о блокировке
      return
    }

    if (energy <= 0) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Валидация клика через античит
    if (!validateClick(x, y)) {
      return
    }

    const clickPower = 1 + totalClickBonus
    const newCarrots = carrots + clickPower

    // Валидация прогресса
    if (!validateProgress(newCarrots, Date.now() - sessionStart)) {
      return
    }

    setCarrots(newCarrots)
    setEnergy(prev => Math.max(0, prev - 1))

    // Auto-save to server every 30s
    useEffect(() => {
      const interval = setInterval(() => {
        if (Date.now() >= autoTapEndTime) {
          setAutoTapActive(false)
        }
      }, 30000)

      return () => clearInterval(interval)
    }, [autoTapEndTime])

    // Auto-tap logic
    if (autoTapActive && energy > 0) {
      const autoTapInterval = setInterval(() => {
        if (energy > 0) {
          setEnergy(prev => prev - 1)
          setCarrots(prev => prev + 1)
        } else {
          setAutoTapActive(false)
          clearInterval(autoTapInterval)
        }
      }, 1000)

      setAutoTapInterval(autoTapInterval)
    }
  }

  const handleClick = (event: React.MouseEvent) => {
    if (isBlocked) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    // Валидация клика
    if (!validateClick(x, y)) {
      return
    }

    const clickPower = 1 + totalClickBonus
    const newCarrots = carrots + clickPower

    // Валидация прогресса
    if (!validateProgress(newCarrots, Date.now() - sessionStart)) {
      return
    }

    setCarrots(newCarrots)
    setEnergy(prev => Math.max(0, prev - 1))

    // Auto-save to server every 30s
    useEffect(() => {
      const interval = setInterval(() => {
        if (Date.now() >= autoTapEndTime) {
          setAutoTapActive(false)
        }
      }, 30000)

      return () => clearInterval(interval)
    }, [autoTapEndTime])

    // Auto-tap logic
    if (autoTapActive && energy > 0) {
      const autoTapInterval = setInterval(() => {
        if (energy > 0) {
          setEnergy(prev => prev - 1)
          setCarrots(prev => prev + 1)
        } else {
          setAutoTapActive(false)
          clearInterval(autoTapInterval)
        }
      }, 1000)

      setAutoTapInterval(autoTapInterval)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 text-white">
      <div className="max-w-md mx-auto p-4 space-y-4">
        
        {/* Добавляем индикатор античита в header */}
        <Card className="p-4 text-center relative">
          {/* Индикатор античита */}
          {(warnings > 0 || isBlocked) && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant={isBlocked ? "destructive" : "secondary"}
                className="text-xs"
              >
                🛡️ {isBlocked ? 'Блок' : `${warnings}⚠️`}
              </Badge>
            </div>
          )}
          
          <h1 className="text-2xl font-bold mb-4">🐹 Guinea Pig Clicker</h1>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Морковки</p>
              <p className="text-lg font-bold">🥕 {carrots.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">GT</p>
              <p className="text-lg font-bold">💎 {gt.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Энергия</p>
              <p className="text-lg font-bold">⚡ {energy}/{maxEnergy}</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {["clicker", "boost", "tasks", "miners"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setActiveTab(tab)}
            >
              {tab === "clicker" && "🐹 Кликер"}
              {tab === "boost" && "🚀 Бусты"}
              {tab === "tasks" && "📋 Задания"}
              {tab === "miners" && "⛏️ Майнеры"}
            </Button>
          ))}
        </div>

        {/* CLICKER TAB */}
        {activeTab === "clicker" && (
          <div className="space-y-4">
            {/* Энергия */}
            <Card className="p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Энергия</span>
                <span className="text-sm text-white">{energy}/{maxEnergy}</span>
              </div>
              <Progress value={(energy / maxEnergy) * 100} className="h-2" />
            </Card>

            {/* Главная кнопка клика с защитой */}
            <Card className="p-6 text-center">
              <div className="text-8xl mb-4 select-none">🐹</div>
              
              {/* Показываем статус блокировки */}
              {isBlocked ? (
                <div className="space-y-2">
                  <Button 
                    size="lg" 
                    className="w-full opacity-50 cursor-not-allowed"
                    disabled
                  >
                    🛡️ Игра заблокирована
                  </Button>
                  <p className="text-red-400 text-sm">
                    Обнаружена подозрительная активность
                  </p>
                </div>
              ) : energy <= 0 ? (
                <Button size="lg" className="w-full opacity-50" disabled>
                  Нет энергии
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
                  onClick={handleMainClick}
                >
                  Кликнуть (+{1 + totalClickBonus} 🥕)
                </Button>
              )}
            </Card>

            {/* ... existing clicker content (auto-tap, etc.) ... */}
          </div>
        )}

        {/* BOOST TAB - остается без изменений */}
        {activeTab === "boost" && (
          <div className="space-y-3">
            {/* ... existing boost content ... */}
          </div>
        )}

        {/* TASKS TAB - остается без изменений */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* ... existing tasks content ... */}
          </div>
        )}

        {/* MINERS TAB - остается без изменений */}
        {activeTab === "miners" && (
          <div className="space-y-3">
            {/* ... existing miners content ... */}
          </div>
        )}

        {/* Добавляем debug панель для разработки */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-3 bg-gray-800/50">
            <details>
              <summary className="text-xs text-gray-400 cursor-pointer">
                🛡️ AntiCheat Debug
              </summary>
              <div className="mt-2 text-xs space-y-1">
                <div>Предупреждения: {warnings}</div>
                <div>Заблокирован: {isBlocked ? 'Да' : 'Нет'}</div>
                <div>Сессия: {Math.floor((Date.now() - sessionStart) / 1000)}с</div>
              </div>
            </details>
          </Card>
        )}
      </div>
    </div>
  )
}

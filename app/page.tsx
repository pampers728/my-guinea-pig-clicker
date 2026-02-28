"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Copy,
  Zap,
  Pickaxe,
  Users,
  Share2,
  UserPlus,
  Coins,
  Crown,
  HomeIcon,
  Globe,
  Lock,
  ShoppingBag,
  TrendingUp,
  ArrowUpCircle,
} from "lucide-react"
import { useTelegram } from "@/components/TelegramProvider"
import { useTranslation, type Language } from "@/lib/i18n"
import {
  PIGS,
  MINERS,
  getPigById,
  calculateXPNeeded,
  getLevelRewards,
  getCurrentMaxEnergy,
  getCurrentCarrotsPerClick,
  getMinerCost,
  getMinerProfit,
  getCarrotsPerClickUpgradeCost,
  getMaxEnergyUpgradeCost,
  CARROT_TO_GT_RATE,
} from "@/lib/pigs"

interface PlayerMiner {
  miner_type: number
  level: number
}

export default function Home() {
  const tg = useTelegram()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)

  const [carrots, setCarrots] = useState(0)
  const [guineaTokens, setGuineaTokens] = useState(0)
  const [telegramStars, setTelegramStars] = useState(0)
  const [energy, setEnergy] = useState(1000)
  const [totalClicks, setTotalClicks] = useState(0)
  const [level, setLevel] = useState(1)
  const [xp, setXP] = useState(0)

  const [activePigId, setActivePigId] = useState("white_basic")
  const [unlockedPigs, setUnlockedPigs] = useState<string[]>(["white_basic"])
  const [showPigsModal, setShowPigsModal] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)

  const [activeTab, setActiveTab] = useState("main")
  const [playerMiners, setPlayerMiners] = useState<PlayerMiner[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"daily" | "weekly" | "alltime">("daily")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [referralLink, setReferralLink] = useState("")
  const [referralBonus, setReferralBonus] = useState(0)
  const [referralsCount, setReferralsCount] = useState(0)
  const [offlineIncome, setOfflineIncome] = useState(0)
  const [showOfflineModal, setShowOfflineModal] = useState(false)

  const [carrotsPerClickLevel, setCarrotsPerClickLevel] = useState(1)
  const [maxEnergyLevel, setMaxEnergyLevel] = useState(1)

  const maxEnergy = getCurrentMaxEnergy(maxEnergyLevel)
  const carrotsPerClick = getCurrentCarrotsPerClick(carrotsPerClickLevel)
  const xpNeeded = calculateXPNeeded(level)

  // Calculate total GT income per hour from miners
  const totalIncomePerHour = playerMiners.reduce((sum, pm) => {
    return sum + getMinerProfit(pm.miner_type, pm.level)
  }, 0) * (1 + referralBonus / 100)

  // Language detection
  useEffect(() => {
    const userLang = tg.user?.language_code || "en"
    const supported = ["en", "ru", "uk", "kk", "pt", "be", "es", "de", "pl", "fr", "zh", "ja", "ko", "tr"]
    setLanguage(supported.includes(userLang) ? (userLang as Language) : "en")
    const userId = tg.user?.id || Date.now()
    setReferralLink(`https://t.me/GuineaPigClicker_bot?start=${userId}`)
    loadPlayerData()
    const startParam = tg.initDataUnsafe?.start_parameter
    if (startParam) handleReferral(Number.parseInt(startParam))
  }, [tg.user])

  // Save to localStorage on every state change (instant persistence)
  useEffect(() => {
    if (isLoading) return
    const userId = tg.user?.id || "guest"
    const data = {
      carrots, guineaTokens, telegramStars, level, xp,
      totalClicks, activePigId, unlockedPigs, playerMiners,
      carrotsPerClickLevel, maxEnergyLevel, referralBonus, referralsCount,
    }
    localStorage.setItem(`gpc_${userId}`, JSON.stringify(data))
    localStorage.setItem(`gpc_carrots_${userId}`, String(carrots))
  }, [carrots, guineaTokens, telegramStars, level, xp, totalClicks, activePigId, unlockedPigs, playerMiners, carrotsPerClickLevel, maxEnergyLevel, referralBonus, referralsCount, isLoading])

  // Auto-save to server every 30s
  useEffect(() => {
    const interval = setInterval(savePlayerData, 30000)
    return () => clearInterval(interval)
  }, [carrots, guineaTokens, telegramStars, level, xp, totalClicks, activePigId, unlockedPigs, playerMiners, carrotsPerClickLevel, maxEnergyLevel])

  // Miners passive income (online = 100%)
  useEffect(() => {
    if (playerMiners.length === 0) return
    const interval = setInterval(() => {
      if (totalIncomePerHour > 0) {
        setGuineaTokens((prev) => prev + totalIncomePerHour / 3600)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [playerMiners, totalIncomePerHour])

  // Energy regen: 1 per second
  useEffect(() => {
    if (energy >= maxEnergy) return
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + 1, maxEnergy))
    }, 1000)
    return () => clearInterval(interval)
  }, [energy, maxEnergy])

  // Loading timeout fallback
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 5000)
    return () => clearTimeout(timeout)
  }, [])

  const loadPlayerData = async () => {
    const userId = tg.user?.id || "guest"

    // 1. Load from localStorage immediately so game works instantly
    const cached = localStorage.getItem(`gpc_${userId}`)
    if (cached) {
      try {
        const d = JSON.parse(cached)
        setCarrots(d.carrots || 0)
        setGuineaTokens(d.guineaTokens || 0)
        setTelegramStars(d.telegramStars || 0)
        setLevel(d.level || 1)
        setXP(d.xp || 0)
        setTotalClicks(d.totalClicks || 0)
        setActivePigId(d.activePigId || "white_basic")
        setUnlockedPigs(d.unlockedPigs || ["white_basic"])
        setCarrotsPerClickLevel(d.carrotsPerClickLevel || 1)
        setMaxEnergyLevel(d.maxEnergyLevel || 1)
        setPlayerMiners(d.playerMiners || [])
        setEnergy(getCurrentMaxEnergy(d.maxEnergyLevel || 1))
        setReferralBonus(d.referralBonus || 0)
        setReferralsCount(d.referralsCount || 0)
      } catch (e) {
        console.error("[v0] localStorage parse error:", e)
      }
    }
    setIsLoading(false)

    // 2. Then sync with Supabase in background
    if (!tg.user) return
    try {
      const res = await fetch("/api/player/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username: tg.user?.username }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (!data || data.error) return

      // Only apply if server data is newer (higher carrots or GT)
      const serverCarrots = data.carrots || 0
      const serverGT = parseFloat(data.guinea_tokens) || 0
      const localCarrots = Number(localStorage.getItem(`gpc_carrots_${userId}`) || 0)

      if (serverCarrots >= localCarrots) {
        setCarrots(data.carrots || 0)
        setGuineaTokens(serverGT)
        setTelegramStars(data.telegram_stars || 0)
        setLevel(data.level || 1)
        setXP(data.xp || 0)
        setTotalClicks(data.total_clicks || 0)
        setActivePigId(data.active_pig_id || "white_basic")
        setUnlockedPigs(data.pigs?.map((p: any) => p.id) || ["white_basic"])
        setReferralBonus(data.referral_bonus || 0)
        setReferralsCount(data.referrals_count || 0)
        setCarrotsPerClickLevel(data.carrots_per_click_level || 1)
        setMaxEnergyLevel(data.max_energy_level || 1)
        setPlayerMiners(data.miners || [])
        setEnergy(getCurrentMaxEnergy(data.max_energy_level || 1))

        if (data.offlineIncome && data.offlineIncome > 0.001) {
          setOfflineIncome(data.offlineIncome)
          setShowOfflineModal(true)
        }
      }
    } catch (e) {
      console.error("[v0] Failed to sync with server:", e)
    }
  }

  const savePlayerData = useCallback(async () => {
    if (!tg.user || isSaving) return
    setIsSaving(true)
    try {
      await fetch("/api/player/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tg.user.id,
          username: tg.user.username,
          carrots,
          guineaTokens,
          telegramStars,
          level,
          xp,
          totalClicks,
          activePigId,
          pigs: unlockedPigs.map((id) => ({ id, rarity: getPigById(id)?.rarity })),
          carrotsPerClickLevel,
          maxEnergyLevel,
        }),
      })
    } catch (e) {
      console.error("[v0] Failed to save:", e)
    } finally {
      setIsSaving(false)
    }
  }, [carrots, guineaTokens, telegramStars, level, xp, totalClicks, activePigId, unlockedPigs, playerMiners, carrotsPerClickLevel, maxEnergyLevel, isSaving, tg.user])

  const handleReferral = async (referrerId: number) => {
    if (!tg.user || tg.user.id === referrerId) return
    try {
      await fetch("/api/referral/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tg.user.id, referrerId }),
      })
    } catch (e) {
      console.error("[v0] Referral error:", e)
    }
  }

  const handleGuineaPigClick = () => {
    if (energy < 1) return
    setCarrots((prev) => prev + carrotsPerClick)
    setEnergy((prev) => prev - 1)
    setTotalClicks((prev) => prev + 1)

    let newXP = xp + 1
    let newLevel = level
    while (newXP >= calculateXPNeeded(newLevel)) {
      newXP -= calculateXPNeeded(newLevel)
      newLevel++
      const rewards = getLevelRewards(newLevel)
      if (rewards.pig) unlockPig(rewards.pig)
    }
    setXP(newXP)
    setLevel(newLevel)
  }

  const unlockPig = (pigId: string) => {
    setUnlockedPigs((prev) => prev.includes(pigId) ? prev : [...prev, pigId])
  }

  // Upgrade carrots per click
  const upgradeCarrotsPerClick = () => {
    const cost = getCarrotsPerClickUpgradeCost(carrotsPerClickLevel)
    if (!cost) return
    if (cost.type === "carrots" && carrots >= cost.amount) {
      setCarrots((prev) => prev - cost.amount)
      setCarrotsPerClickLevel((prev) => prev + 1)
    } else if (cost.type === "gt" && guineaTokens >= cost.amount) {
      setGuineaTokens((prev) => prev - cost.amount)
      setCarrotsPerClickLevel((prev) => prev + 1)
    }
  }

  // Upgrade max energy
  const upgradeMaxEnergy = () => {
    const cost = getMaxEnergyUpgradeCost(maxEnergyLevel)
    if (!cost) return
    if (cost.type === "carrots" && carrots >= cost.amount) {
      setCarrots((prev) => prev - cost.amount)
      setMaxEnergyLevel((prev) => prev + 1)
    } else if (cost.type === "gt" && guineaTokens >= cost.amount) {
      setGuineaTokens((prev) => prev - cost.amount)
      setMaxEnergyLevel((prev) => prev + 1)
    }
  }

  const exchangeCarrotsForGT = () => {
    if (carrots < CARROT_TO_GT_RATE) return
    const gtToAdd = Math.floor(carrots / CARROT_TO_GT_RATE)
    setCarrots((prev) => prev - gtToAdd * CARROT_TO_GT_RATE)
    setGuineaTokens((prev) => prev + gtToAdd)
    setShowConvertModal(false)
  }

  // Buy/upgrade miner
  const buyOrUpgradeMiner = async (minerType: number) => {
    const existing = playerMiners.find((m) => m.miner_type === minerType)
    const currentLevel = existing?.level || 0
    if (currentLevel >= 5) return

    const cost = getMinerCost(minerType, currentLevel + 1)
    if (guineaTokens < cost) return

    setGuineaTokens((prev) => prev - cost)

    const updated = existing
      ? playerMiners.map((m) => m.miner_type === minerType ? { ...m, level: m.level + 1 } : m)
      : [...playerMiners, { miner_type: minerType, level: 1 }]
    setPlayerMiners(updated)

    // Save miner to DB
    try {
      await fetch("/api/miners/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tg.user?.id || Date.now(), minerType, newLevel: currentLevel + 1 }),
      })
    } catch (e) {
      console.error("[v0] Miner save error:", e)
    }
  }

  const buyGTWithStars = async (gtAmount: number) => {
    if (isPurchasing || !tg.user) return
    setIsPurchasing(true)
    try {
      const res = await fetch("/api/buy-stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tg.user.id, gtAmount, currency: "XTR" }),
      })
      const data = await res.json()
      if (data.success) {
        let attempts = 0
        const poll = setInterval(async () => {
          attempts++
          const balRes = await fetch(`/api/get-balance/${tg.user!.id}`)
          const bal = await balRes.json()
          if (bal.guinea_tokens > guineaTokens) {
            setGuineaTokens(bal.guinea_tokens)
            setTelegramStars(bal.telegram_stars)
            clearInterval(poll)
          }
          if (attempts >= 40) clearInterval(poll)
        }, 3000)
      }
    } catch (e) {
      console.error("[v0] Purchase error:", e)
    } finally {
      setTimeout(() => setIsPurchasing(false), 3000)
    }
  }

  const loadLeaderboard = async (period: "daily" | "weekly" | "alltime") => {
    try {
      const res = await fetch(`/api/leaderboard/${period}`)
      const data = await res.json()
      setLeaderboard(data.data || [])
    } catch (e) {
      console.error("[v0] Leaderboard error:", e)
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
  }

  const shareReferralLink = () => {
    if (tg.isAvailable) {
      window.open(`https://t.me/share/url?url=${referralLink}&text=Join%20Guinea%20Pig%20Clicker!`, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="mb-4 text-6xl animate-bounce">🐹</div>
          <div className="text-white text-lg">{t("game.loading")}</div>
        </div>
      </div>
    )
  }

  const activePig = getPigById(activePigId)
  const clickCostInfo = getCarrotsPerClickUpgradeCost(carrotsPerClickLevel)
  const energyCostInfo = getMaxEnergyUpgradeCost(maxEnergyLevel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border-b border-purple-500/30 p-2">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span className="font-bold text-yellow-400">{guineaTokens.toFixed(2)} GT</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs">
              <span>⭐</span>
              <span className="font-bold text-blue-400">{telegramStars}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs">
              <span className="font-bold text-gray-300">Lvl {level}</span>
              <span className="text-gray-400">{xp}/{xpNeeded} XP</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" onClick={() => setShowLanguageModal(true)} className="bg-blue-600 hover:bg-blue-700 px-2 h-8">
              <Globe className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={() => setShowPigsModal(true)} className="bg-pink-600 hover:bg-pink-700 px-2 h-8">
              <img src={activePig?.icon || "/placeholder.svg"} alt="pig" className="w-5 h-5 rounded-full object-contain" />
            </Button>
            <Button size="sm" onClick={() => setShowConvertModal(true)} className="bg-orange-600 hover:bg-orange-700 px-2 h-8 text-xs font-bold">
              🥕→GT
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4 max-w-2xl">

        {/* MAIN TAB */}
        {activeTab === "main" && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="text-2xl font-bold text-orange-400">{carrots.toLocaleString()} 🥕</div>
              {totalIncomePerHour > 0 && (
                <Card className="bg-green-900/30 border-green-500/30 p-2">
                  <div className="text-xs text-gray-300">Пассивный доход</div>
                  <div className="text-base font-bold text-green-400">+{totalIncomePerHour.toFixed(4)} GT/ч</div>
                  {referralBonus > 0 && <div className="text-xs text-green-300">+{referralBonus}% реферальный бонус</div>}
                </Card>
              )}

              <button
                onClick={handleGuineaPigClick}
                disabled={energy < 1}
                className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 shadow-2xl mx-auto"
              >
                {activePig && (
                  <img
                    src={activePig.icon || "/placeholder.svg"}
                    alt={activePig.name[language]}
                    className="w-4/5 h-4/5 object-contain"
                  />
                )}
              </button>

              <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-2">
                <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                <Progress value={(energy / maxEnergy) * 100} className="h-2 flex-1" />
                <span className="text-xs font-medium">{energy}/{maxEnergy}</span>
              </div>
              <p className="text-xs text-gray-400">+{carrotsPerClick} 🥕 за тап</p>
            </div>
          </div>
        )}

        {/* MINERS TAB */}
        {activeTab === "miners" && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white text-center">Майнеры</h2>
            {totalIncomePerHour > 0 && (
              <Card className="bg-green-900/30 border-green-500/30 p-3 text-center">
                <p className="text-xs text-gray-400">Общий пассивный доход</p>
                <p className="text-lg font-bold text-green-400">+{totalIncomePerHour.toFixed(4)} GT / час</p>
                <p className="text-xs text-green-300">+{(totalIncomePerHour * 24).toFixed(3)} GT / день</p>
              </Card>
            )}
            <div className="grid grid-cols-1 gap-3">
              {MINERS.map((minerDef) => {
                const owned = playerMiners.find((m) => m.miner_type === minerDef.id)
                const currentLevel = owned?.level || 0
                const isMaxLevel = currentLevel >= 5
                const nextCost = isMaxLevel ? 0 : getMinerCost(minerDef.id, currentLevel + 1)
                const currentProfit = currentLevel > 0 ? getMinerProfit(minerDef.id, currentLevel) : 0
                const nextProfit = !isMaxLevel ? getMinerProfit(minerDef.id, (currentLevel || 1)) : 0
                const canAfford = guineaTokens >= nextCost

                return (
                  <Card
                    key={minerDef.id}
                    className={`border p-3 ${currentLevel > 0 ? "bg-purple-900/40 border-purple-500/40" : "bg-black/30 border-gray-700/40"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="text-2xl shrink-0">{minerDef.icon}</div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-white truncate">
                            {minerDef.name[language] || minerDef.name.en}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-1">
                              Уровень {currentLevel}/5
                            </Badge>
                            {currentLevel > 0 ? (
                              <span className="text-[10px] text-green-400">
                                +{currentProfit.toFixed(3)} GT/час
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-500">
                                Доход: {nextProfit.toFixed(3)} GT/час
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isMaxLevel ? (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-xs">MAX</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => buyOrUpgradeMiner(minerDef.id)}
                            disabled={!canAfford}
                            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-40 text-xs h-10 px-3"
                          >
                            <div className="flex flex-col items-center leading-tight">
                              <span className="font-semibold">{currentLevel === 0 ? "Купить" : "Улучшить"}</span>
                              <span className="font-bold text-white">{nextCost} GT</span>
                            </div>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* UPGRADES TAB */}
        {activeTab === "upgrades" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">Апгрейды</h2>

            {/* Carrots per click upgrade */}
            <Card className="bg-purple-900/30 border-purple-500/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">Морковки за клик</h3>
                  <p className="text-xs text-gray-400">Уровень {carrotsPerClickLevel}/10</p>
                  <p className="text-xs text-orange-400">Сейчас: {carrotsPerClick} 🥕 за клик</p>
                  {carrotsPerClickLevel < 10 && (
                    <p className="text-xs text-green-400">Следующий: {carrotsPerClickLevel + 1} 🥕 за клик</p>
                  )}
                </div>
                {clickCostInfo ? (
                  <Button
                    onClick={upgradeCarrotsPerClick}
                    disabled={clickCostInfo.type === "carrots" ? carrots < clickCostInfo.amount : guineaTokens < clickCostInfo.amount}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 shrink-0"
                    size="sm"
                  >
                    <div className="flex flex-col items-center leading-tight text-xs">
                      <span>Улучшить</span>
                      <span className="font-bold">
                        {clickCostInfo.amount.toLocaleString()} {clickCostInfo.type === "carrots" ? "🥕" : "GT"}
                      </span>
                    </div>
                  </Button>
                ) : (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">MAX</Badge>
                )}
              </div>
            </Card>

            {/* Max energy upgrade */}
            <Card className="bg-blue-900/30 border-blue-500/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">Максимальная энергия</h3>
                  <p className="text-xs text-gray-400">Уровень {maxEnergyLevel}/10</p>
                  <p className="text-xs text-blue-400">Сейчас: {maxEnergy} энергии</p>
                  {maxEnergyLevel < 10 && (
                    <p className="text-xs text-green-400">Следующий: {getCurrentMaxEnergy(maxEnergyLevel + 1)} энергии</p>
                  )}
                </div>
                {energyCostInfo ? (
                  <Button
                    onClick={upgradeMaxEnergy}
                    disabled={energyCostInfo.type === "carrots" ? carrots < energyCostInfo.amount : guineaTokens < energyCostInfo.amount}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 shrink-0"
                    size="sm"
                  >
                    <div className="flex flex-col items-center leading-tight text-xs">
                      <span>Улучшить</span>
                      <span className="font-bold">
                        {energyCostInfo.amount.toLocaleString()} {energyCostInfo.type === "carrots" ? "🥕" : "GT"}
                      </span>
                    </div>
                  </Button>
                ) : (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">MAX</Badge>
                )}
              </div>
            </Card>

            {/* Convert carrots */}
            <Card className="bg-orange-900/30 border-orange-500/30 p-4">
              <h3 className="font-semibold text-white text-center mb-2">Обмен морковок</h3>
              <p className="text-sm text-gray-300 text-center mb-3">250,000 🥕 = 1 GT</p>
              <p className="text-xs text-gray-400 text-center mb-3">У вас: {carrots.toLocaleString()} 🥕 → {Math.floor(carrots / CARROT_TO_GT_RATE)} GT</p>
              <Button
                onClick={exchangeCarrotsForGT}
                disabled={carrots < CARROT_TO_GT_RATE}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:opacity-40"
              >
                Обменять ({Math.floor(carrots / CARROT_TO_GT_RATE)} GT)
              </Button>
            </Card>
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab === "friends" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">{t("friends.title")}</h2>
            <Card className="bg-purple-900/30 border-purple-500/30 p-4">
              <p className="text-xs text-gray-300 mb-2">{t("friends.link")}</p>
              <div className="flex gap-2">
                <input type="text" value={referralLink} readOnly className="flex-1 bg-black/30 text-white px-3 py-2 rounded text-xs" />
                <Button onClick={copyReferralLink} size="sm" className="bg-green-600 hover:bg-green-700"><Copy className="w-4 h-4" /></Button>
                <Button onClick={shareReferralLink} size="sm" className="bg-blue-600 hover:bg-blue-700"><Share2 className="w-4 h-4" /></Button>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-green-900/30 border-green-500/30 p-4 text-center">
                <UserPlus className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{referralsCount}</div>
                <div className="text-xs text-gray-400">{t("friends.count")}</div>
              </Card>
              <Card className="bg-yellow-900/30 border-yellow-500/30 p-4 text-center">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">+{referralBonus}%</div>
                <div className="text-xs text-gray-400">{t("friends.bonus")}</div>
              </Card>
            </div>
            <Card className="bg-black/20 border-gray-700/30 p-4">
              <h3 className="font-semibold text-sm text-white mb-3">Наши соцсети</h3>
              <div className="space-y-2">
                <a href="https://tiktok.com/@guinea.pig.clicker.en" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-300 hover:text-white">
                  <span className="text-lg">🎵</span> TikTok EN @guinea.pig.clicker.en
                </a>
                <a href="https://tiktok.com/@guinea.pig.clicker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-300 hover:text-white">
                  <span className="text-lg">🎵</span> TikTok СНГ @guinea.pig.clicker
                </a>
                <a href="https://www.youtube.com/@GuineaPigClicker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-300 hover:text-white">
                  <span className="text-lg">▶️</span> YouTube @GuineaPigClicker
                </a>
              </div>
            </Card>
          </div>
        )}

        {/* SHOP TAB */}
        {activeTab === "shop" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">{t("tab.shop")}</h2>
            <p className="text-xs text-gray-400 text-center">{t("shop.buy_gt_description")}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { gt: 100, stars: 50 },
                { gt: 500, stars: 250 },
                { gt: 1000, stars: 500 },
                { gt: 3000, stars: 1400 },
                { gt: 5000, stars: 2300 },
                { gt: 7000, stars: 3200 },
              ].map((pack) => (
                <Button
                  key={pack.gt}
                  onClick={() => buyGTWithStars(pack.gt)}
                  disabled={isPurchasing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-auto py-3 flex flex-col gap-1 disabled:opacity-50"
                >
                  <span className="font-bold text-base">{pack.gt} GT</span>
                  <span className="text-xs opacity-80">{pack.stars} ⭐</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              {t("leaderboard.title")}
            </h2>
            <div className="flex gap-2 justify-center">
              {(["daily", "weekly", "alltime"] as const).map((p) => (
                <Button key={p} size="sm" onClick={() => { setLeaderboardPeriod(p); loadLeaderboard(p) }}
                  variant={leaderboardPeriod === p ? "default" : "outline"} className="text-xs">
                  {t(`leaderboard.${p}`)}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">Пока нет данных</p>
              ) : leaderboard.map((player, i) => (
                <Card key={i} className="bg-purple-900/30 border-purple-500/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-yellow-400">#{i + 1}</div>
                      <div>
                        <div className="font-semibold text-sm">{player.username}</div>
                        <div className="text-xs text-gray-400">Lvl {player.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400 text-sm">{player.score?.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">carrots</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-purple-500/30">
        <div className="grid grid-cols-6 bg-gray-900/50 p-2 rounded-t-2xl max-w-2xl mx-auto">
          {[
            { id: "main", icon: <HomeIcon className="w-5 h-5" />, label: t("tab.main") },
            { id: "miners", icon: <Pickaxe className="w-5 h-5" />, label: t("tab.miners") },
            { id: "upgrades", icon: <ArrowUpCircle className="w-5 h-5" />, label: t("tab.upgrades") },
            { id: "friends", icon: <Users className="w-5 h-5" />, label: t("tab.friends") },
            { id: "shop", icon: <ShoppingBag className="w-5 h-5" />, label: t("tab.shop") },
            { id: "leaderboard", icon: <Crown className="w-5 h-5" />, label: t("tab.leaderboard"), onClick: () => loadLeaderboard(leaderboardPeriod) },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); tab.onClick?.() }}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors text-[10px] ${
                activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pig collection modal */}
      <Dialog open={showPigsModal} onOpenChange={setShowPigsModal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-purple-500/30 text-white max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t("pigs.collection")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 p-2">
            {PIGS.map((pig) => {
              const isUnlocked = unlockedPigs.includes(pig.id)
              const isActive = activePigId === pig.id
              return (
                <div
                  key={pig.id}
                  onClick={() => isUnlocked && setActivePigId(pig.id)}
                  className={`relative rounded-lg p-2 cursor-pointer transition-all ${
                    isActive ? "bg-gradient-to-br from-purple-600 to-blue-600 ring-2 ring-yellow-400"
                    : isUnlocked ? "bg-purple-900/50 hover:scale-105"
                    : "bg-black/50 opacity-50"
                  }`}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <img src={pig.icon || "/placeholder.svg"} alt={pig.name[language]} className="w-full h-auto rounded-lg" />
                  <div className="mt-1 text-center">
                    <div className="text-xs font-semibold truncate">{pig.name[language]}</div>
                    <Badge variant="outline" className={`mt-1 text-[10px] ${
                      pig.rarity === "LIMITED" ? "bg-yellow-600"
                      : pig.rarity === "EVENT" ? "bg-red-600"
                      : pig.rarity === "RARE" ? "bg-purple-600"
                      : "bg-gray-600"
                    }`}>{pig.rarity}</Badge>
                    {!isUnlocked && pig.unlockLevel && (
                      <div className="text-[10px] text-gray-400 mt-1">Lvl {pig.unlockLevel}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Language modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-purple-500/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t("settings.language")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {[
              { code: "en", flag: "🇺🇸", name: "English" },
              { code: "ru", flag: "🇷🇺", name: "Русский" },
              { code: "uk", flag: "🇺🇦", name: "Українська" },
              { code: "kk", flag: "🇰🇿", name: "Қазақша" },
              { code: "pt", flag: "🇧🇷", name: "Português" },
              { code: "be", flag: "🇧🇾", name: "Беларуская" },
              { code: "es", flag: "🇪🇸", name: "Español" },
              { code: "de", flag: "🇩🇪", name: "Deutsch" },
              { code: "pl", flag: "🇵🇱", name: "Polski" },
              { code: "fr", flag: "🇫🇷", name: "Français" },
              { code: "zh", flag: "🇨🇳", name: "中文" },
              { code: "ja", flag: "🇯🇵", name: "日本語" },
              { code: "ko", flag: "🇰🇷", name: "한국어" },
              { code: "tr", flag: "🇹🇷", name: "Türkçe" },
            ].map((lang) => (
              <Button key={lang.code} onClick={() => { setLanguage(lang.code as Language); setShowLanguageModal(false) }}
                className={`flex items-center gap-2 justify-start h-auto py-2 text-sm ${language === lang.code ? "bg-purple-600" : "bg-black/30"}`}>
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert modal */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-orange-500/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Обмен морковок на GT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <p className="text-center text-gray-300">250,000 🥕 = 1 GT</p>
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-400">У вас: {carrots.toLocaleString()} 🥕</p>
              <p className="text-xl font-bold text-yellow-400 mt-1">= {Math.floor(carrots / CARROT_TO_GT_RATE)} GT</p>
            </div>
            <Button
              onClick={exchangeCarrotsForGT}
              disabled={carrots < CARROT_TO_GT_RATE}
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:opacity-40"
            >
              Обменять ({Math.floor(carrots / CARROT_TO_GT_RATE)} GT)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offline income modal */}
      <Dialog open={showOfflineModal} onOpenChange={setShowOfflineModal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-green-500/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Пока вас не было...</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 p-2 text-center">
            <p className="text-gray-300">Ваши майнеры поработали и заработали:</p>
            <p className="text-3xl font-bold text-green-400">+{offlineIncome.toFixed(4)} GT</p>
            <p className="text-xs text-gray-400">(50% от дневного дохода, макс. 24ч)</p>
            <Button onClick={() => setShowOfflineModal(false)} className="w-full bg-green-600 hover:bg-green-700">
              Забрать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

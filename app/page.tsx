"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Zap, Pickaxe, Users, Coins, Crown, HomeIcon, Globe, ShoppingBag, ArrowUpCircle, Gift, Gamepad2, ListTodo, Trophy } from "lucide-react"
import { useTelegram } from "@/components/TelegramProvider"
import { useTranslation, type Language } from "@/lib/i18n"
import {
  PIGS, getPigById, calculateXPNeeded, getLevelRewards,
  getCurrentMaxEnergy, getCurrentCarrotsPerClick,
  getMinerCost, CARROT_TO_GT_RATE, getCarrotsPerClickUpgradeCost, getMaxEnergyUpgradeCost, getMinerProfit,
} from "@/lib/pigs"

import MinersTab from "@/components/tabs/MinersTab"
import UpgradesTab from "@/components/tabs/UpgradesTab"
import BonusesTab from "@/components/tabs/BonusesTab"
import LeaderboardTab from "@/components/tabs/LeaderboardTab"
import FriendsTab from "@/components/tabs/FriendsTab"
import ShopTab from "@/components/tabs/ShopTab"
import GamesTab from "@/components/tabs/GamesTab"
import QuestsTab, { type Quest } from "@/components/tabs/QuestsTab"
import AchievementsTab, { ALL_ACHIEVEMENTS, type Achievement } from "@/components/tabs/AchievementsTab"
import DailyRewards from "@/components/DailyRewards"
import ChestOpener, { ChestCard, type ChestType } from "@/components/ChestOpener"

interface PlayerMiner { miner_type: number; level: number }

const BOSS_COOLDOWN_MS = 3 * 60 * 60 * 1000 // 3 hours
const FREE_CHEST_COOLDOWN_MS = 6 * 60 * 60 * 1000 // 6 hours

function makeDefaultQuests(totalClicks: number, totalCarrots: number): Quest[] {
  return [
    { id: "q_clicks", title: "Тапер дня", description: "Нажать 500 раз", icon: "👆", target: 500, progress: Math.min(500, totalClicks), reward: { type: "carrots", amount: 5000 }, claimed: false },
    { id: "q_carrots", title: "Большой урожай", description: "Заработать 100 000 морковок", icon: "🥕", target: 100000, progress: Math.min(100000, totalCarrots), reward: { type: "carrots", amount: 10000 }, claimed: false },
    { id: "q_spin", title: "Удача", description: "Выиграть в колесе 2 раза", icon: "🎰", target: 2, progress: 0, reward: { type: "gt", amount: 1 }, claimed: false },
    { id: "q_game", title: "Игроман", description: "Сыграть в мини-игру 1 раз", icon: "🎮", target: 1, progress: 0, reward: { type: "ticket", amount: 3 }, claimed: false },
  ]
}

export default function Home() {
  const tg = useTelegram()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)

  // Core resources
  const [carrots, setCarrots] = useState(0)
  const [guineaTokens, setGuineaTokens] = useState(0)
  const [telegramStars, setTelegramStars] = useState(0)
  const [energy, setEnergy] = useState(1000)
  const [totalClicks, setTotalClicks] = useState(0)
  const [totalCarrotsEarned, setTotalCarrotsEarned] = useState(0)
  const [level, setLevel] = useState(1)
  const [xp, setXP] = useState(0)

  // Pig / miners / upgrades
  const [activePigId, setActivePigId] = useState("white_basic")
  const [unlockedPigs, setUnlockedPigs] = useState<string[]>(["white_basic"])
  const [playerMiners, setPlayerMiners] = useState<PlayerMiner[]>([])
  const [carrotsPerClickLevel, setCarrotsPerClickLevel] = useState(1)
  const [maxEnergyLevel, setMaxEnergyLevel] = useState(1)

  // Referrals
  const [referralLink, setReferralLink] = useState("")
  const [referralBonus, setReferralBonus] = useState(0)
  const [referralsCount, setReferralsCount] = useState(0)

  // Daily / boosts
  const [wheelSpinsLeft, setWheelSpinsLeft] = useState(3)
  const [carrotRewardClaimed, setCarrotRewardClaimed] = useState(false)
  const [energyRewardClaimed, setEnergyRewardClaimed] = useState(false)
  const [autoTapActive, setAutoTapActive] = useState(false)
  const [autoTapEndTime, setAutoTapEndTime] = useState(0)
  const [boosterActive, setBoosterActive] = useState(false)
  const [boosterEndTime, setBoosterEndTime] = useState(0)
  const [boosterMultiplier, setBoosterMultiplier] = useState(2)

  // Daily rewards streak
  const [streakDay, setStreakDay] = useState(1)
  const [lastDailyClaimDate, setLastDailyClaimDate] = useState("")
  const [showDailyRewards, setShowDailyRewards] = useState(false)

  // Quests
  const [quests, setQuests] = useState<Quest[]>([])
  const [wheelWins, setWheelWins] = useState(0)
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [questsResetDate, setQuestsResetDate] = useState("")

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(ALL_ACHIEVEMENTS.map(a => ({ ...a })))
  const [bossesDefeated, setBossesDefeated] = useState(0)

  // Chests
  const [freeChestNextTime, setFreeChestNextTime] = useState(0)
  const [openingChest, setOpeningChest] = useState<ChestType | null>(null)
  const [pendingChests, setPendingChests] = useState<ChestType[]>([])

  // Boss
  const [bossNextTime, setBossNextTime] = useState(0)

  // Gamble
  const [freeGambleUsed, setFreeGambleUsed] = useState(false)

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"daily" | "weekly" | "alltime">("daily")

  // UI
  const [activeTab, setActiveTab] = useState("main")
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPigsModal, setShowPigsModal] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  const maxEnergy = getCurrentMaxEnergy(maxEnergyLevel)
  const carrotsPerClick = getCurrentCarrotsPerClick(carrotsPerClickLevel)
  const xpNeeded = calculateXPNeeded(level)
  const totalIncomePerHour = playerMiners.reduce((sum, pm) => sum + getMinerProfit(pm.miner_type, pm.level), 0) * (1 + referralBonus / 100)
  const userId = tg.user?.id ? String(tg.user.id) : "guest"
  const freeChestAvailable = Date.now() >= freeChestNextTime
  const bossAvailable = Date.now() >= bossNextTime

  // Init
  useEffect(() => {
    const userLang = tg.user?.language_code || "en"
    const supported = ["en", "ru", "uk", "kk", "pt", "be", "es", "de", "pl", "fr", "zh", "ja", "ko", "tr"]
    setLanguage(supported.includes(userLang) ? (userLang as Language) : "en")
    setReferralLink(`https://t.me/GuineaPigClicker_bot?start=${userId}`)
    loadPlayerData()
    const startParam = tg.initDataUnsafe?.start_parameter
    if (startParam) handleReferral(Number.parseInt(startParam))
  }, [tg.user])

  // Daily reset
  useEffect(() => {
    const today = new Date().toDateString()
    const lastReset = localStorage.getItem(`gpc_daily_${userId}`)
    if (lastReset !== today) {
      setWheelSpinsLeft(3)
      setCarrotRewardClaimed(false)
      setEnergyRewardClaimed(false)
      setFreeGambleUsed(false)
      localStorage.setItem(`gpc_daily_${userId}`, today)
    } else {
      setWheelSpinsLeft(Number(localStorage.getItem(`gpc_spins_${userId}`) || 3))
      setCarrotRewardClaimed(localStorage.getItem(`gpc_carrotReward_${userId}`) === "1")
      setEnergyRewardClaimed(localStorage.getItem(`gpc_energyReward_${userId}`) === "1")
      setFreeGambleUsed(localStorage.getItem(`gpc_freeGamble_${userId}`) === "1")
    }

    // Show daily rewards popup once a day
    const lastDaily = localStorage.getItem(`gpc_dailyReward_shown_${userId}`)
    if (lastDaily !== today) {
      setTimeout(() => setShowDailyRewards(true), 1500)
    }

    // Reset quests daily
    if (questsResetDate !== today) {
      setQuestsResetDate(today)
      setWheelWins(0)
      setGamesPlayed(0)
    }
  }, [userId])

  // Auto-tap
  useEffect(() => {
    if (!autoTapActive) return
    const interval = setInterval(() => {
      if (Date.now() >= autoTapEndTime) { setAutoTapActive(false); clearInterval(interval); return }
      setCarrots(p => p + carrotsPerClick)
      setTotalCarrotsEarned(p => p + carrotsPerClick)
      setXP(p => p + 1)
      setTotalClicks(p => p + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [autoTapActive, autoTapEndTime, carrotsPerClick])

  // Booster timer
  useEffect(() => {
    if (!boosterActive) return
    const interval = setInterval(() => { if (Date.now() >= boosterEndTime) setBoosterActive(false) }, 5000)
    return () => clearInterval(interval)
  }, [boosterActive, boosterEndTime])

  // Miners income
  useEffect(() => {
    if (!playerMiners.length) return
    const interval = setInterval(() => { if (totalIncomePerHour > 0) setGuineaTokens(p => p + totalIncomePerHour / 3600) }, 1000)
    return () => clearInterval(interval)
  }, [playerMiners, totalIncomePerHour])

  // Energy regen
  useEffect(() => {
    if (energy >= maxEnergy) return
    const interval = setInterval(() => setEnergy(p => Math.min(p + 1, maxEnergy)), 1000)
    return () => clearInterval(interval)
  }, [energy, maxEnergy])

  // Persist
  useEffect(() => {
    if (isLoading) return
    const data = {
      carrots, guineaTokens, telegramStars, level, xp, totalClicks, totalCarrotsEarned,
      activePigId, unlockedPigs, playerMiners, carrotsPerClickLevel, maxEnergyLevel,
      referralBonus, referralsCount, streakDay, lastDailyClaimDate,
      freeChestNextTime, bossNextTime, bossesDefeated, achievements,
    }
    localStorage.setItem(`gpc_${userId}`, JSON.stringify(data))
  }, [carrots, guineaTokens, level, xp, totalClicks, totalCarrotsEarned, activePigId, unlockedPigs, playerMiners, carrotsPerClickLevel, maxEnergyLevel, referralBonus, referralsCount, streakDay, lastDailyClaimDate, freeChestNextTime, bossNextTime, bossesDefeated, achievements, isLoading])

  // Update quests
  useEffect(() => {
    if (isLoading || !quests.length) return
    setQuests(prev => prev.map(q => {
      if (q.claimed) return q
      if (q.id === "q_clicks") return { ...q, progress: Math.min(q.target, totalClicks) }
      if (q.id === "q_carrots") return { ...q, progress: Math.min(q.target, totalCarrotsEarned) }
      if (q.id === "q_spin") return { ...q, progress: Math.min(q.target, wheelWins) }
      if (q.id === "q_game") return { ...q, progress: Math.min(q.target, gamesPlayed) }
      return q
    }))
  }, [totalClicks, totalCarrotsEarned, wheelWins, gamesPlayed])

  // Update achievements
  useEffect(() => {
    if (isLoading) return
    setAchievements(prev => prev.map(a => {
      if (a.unlocked) return a
      let progress = a.progress
      if (a.id === "first_click" || a.id === "clicks_1000" || a.id === "clicks_10000") progress = totalClicks
      if (a.id === "carrots_100k" || a.id === "carrots_1m") progress = totalCarrotsEarned
      if (a.id === "miner_1") progress = playerMiners.length > 0 ? 1 : 0
      if (a.id === "all_miners") progress = playerMiners.length
      if (a.id === "level_10" || a.id === "level_25") progress = level
      if (a.id === "boss_1") progress = bossesDefeated
      if (a.id === "referrals_5") progress = referralsCount
      if (a.id === "streak_7") progress = streakDay
      const unlocked = progress >= a.target
      return { ...a, progress, unlocked }
    }))
  }, [totalClicks, totalCarrotsEarned, playerMiners, level, bossesDefeated, referralsCount, streakDay])

  // Loading fallback
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 5000)
    return () => clearTimeout(t)
  }, [])

  const loadPlayerData = () => {
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
        setTotalCarrotsEarned(d.totalCarrotsEarned || 0)
        setActivePigId(d.activePigId || "white_basic")
        setUnlockedPigs(d.unlockedPigs || ["white_basic"])
        setCarrotsPerClickLevel(d.carrotsPerClickLevel || 1)
        setMaxEnergyLevel(d.maxEnergyLevel || 1)
        setPlayerMiners(d.playerMiners || [])
        setEnergy(getCurrentMaxEnergy(d.maxEnergyLevel || 1))
        setReferralBonus(d.referralBonus || 0)
        setReferralsCount(d.referralsCount || 0)
        setStreakDay(d.streakDay || 1)
        setLastDailyClaimDate(d.lastDailyClaimDate || "")
        setFreeChestNextTime(d.freeChestNextTime || 0)
        setBossNextTime(d.bossNextTime || 0)
        setBossesDefeated(d.bossesDefeated || 0)
        if (d.achievements) setAchievements(d.achievements)

        const today = new Date().toDateString()
        setQuests(makeDefaultQuests(d.totalClicks || 0, d.totalCarrotsEarned || 0))
        setQuestsResetDate(today)
      } catch {}
    } else {
      setQuests(makeDefaultQuests(0, 0))
    }
    setIsLoading(false)
  }

  const handleReferral = async (referrerId: number) => {
    if (!tg.user || tg.user.id === referrerId) return
    try { await fetch("/api/referral/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, referrerId }) }) } catch {}
  }

  const handleClick = () => {
    if (energy < 1) return
    const mult = boosterActive ? boosterMultiplier : 1
    const earned = carrotsPerClick * mult
    setCarrots(p => p + earned)
    setTotalCarrotsEarned(p => p + earned)
    setEnergy(p => p - 1)
    setTotalClicks(p => p + 1)
    let newXP = xp + 1, newLevel = level
    while (newXP >= calculateXPNeeded(newLevel)) {
      newXP -= calculateXPNeeded(newLevel)
      newLevel++
      const r = getLevelRewards(newLevel)
      if (r.pig) setUnlockedPigs(prev => prev.includes(r.pig!) ? prev : [...prev, r.pig!])
    }
    setXP(newXP)
    setLevel(newLevel)
  }

  const handleWheelSpin = () => {
    const n = wheelSpinsLeft - 1
    setWheelSpinsLeft(n)
    localStorage.setItem(`gpc_spins_${userId}`, String(n))
  }

  const handleWheelPrize = (prize: any, value: number) => {
    if (prize.type === "carrots") { setCarrots(p => p + value); setTotalCarrotsEarned(p => p + value) }
    else if (prize.type === "energy") setEnergy(p => Math.min(p + value, maxEnergy))
    else if (prize.type === "gt") setGuineaTokens(p => p + value)
    else if (prize.type === "autotap") { setAutoTapActive(true); setAutoTapEndTime(Date.now() + value * 60000) }
    else if (prize.type === "booster") { setBoosterActive(true); setBoosterEndTime(Date.now() + value * 60000); setBoosterMultiplier(2) }
    setWheelWins(p => p + 1)
  }

  const claimCarrots = () => {
    setCarrots(p => p + 2000)
    setTotalCarrotsEarned(p => p + 2000)
    setCarrotRewardClaimed(true)
    localStorage.setItem(`gpc_carrotReward_${userId}`, "1")
  }

  const claimEnergy = () => {
    setEnergy(p => Math.min(p + 1000, maxEnergy))
    setEnergyRewardClaimed(true)
    localStorage.setItem(`gpc_energyReward_${userId}`, "1")
  }

  const handleDailyRewardClaim = (reward: { type: string; amount: number }) => {
    if (reward.type === "carrots") { setCarrots(p => p + reward.amount); setTotalCarrotsEarned(p => p + reward.amount) }
    else if (reward.type === "gt") setGuineaTokens(p => p + reward.amount)
    else if (reward.type === "chest") setPendingChests(p => [...p, "rare"])
    const today = new Date().toDateString()
    setLastDailyClaimDate(today)
    localStorage.setItem(`gpc_dailyReward_shown_${userId}`, today)
    const nextDay = streakDay >= 7 ? 1 : streakDay + 1
    setStreakDay(nextDay)
    setShowDailyRewards(false)
  }

  const handleQuestClaim = (questId: string) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest) return
    if (quest.reward.type === "carrots") { setCarrots(p => p + quest.reward.amount); setTotalCarrotsEarned(p => p + quest.reward.amount) }
    else if (quest.reward.type === "gt") setGuineaTokens(p => p + quest.reward.amount)
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q))
  }

  const handleChestReward = (reward: { type: string; amount: number }) => {
    if (reward.type === "carrots") { setCarrots(p => p + reward.amount); setTotalCarrotsEarned(p => p + reward.amount) }
    else if (reward.type === "gt") setGuineaTokens(p => p + reward.amount)
    else if (reward.type === "booster") { setBoosterActive(true); setBoosterEndTime(Date.now() + reward.amount * 60000); setBoosterMultiplier(2) }
    else if (reward.type === "autotap") { setAutoTapActive(true); setAutoTapEndTime(Date.now() + reward.amount * 60000) }
    if (openingChest === "free") setFreeChestNextTime(Date.now() + FREE_CHEST_COOLDOWN_MS)
    setPendingChests(p => p.slice(1))
    setOpeningChest(null)
  }

  const openFreeChest = () => { if (freeChestAvailable) setOpeningChest("free") }
  const openPremiumChest = () => { if (guineaTokens >= 5) { setGuineaTokens(p => p - 5); setOpeningChest("premium") } }

  const handleBossVictory = (reward: "chest" | "boost", boostMin?: number) => {
    if (reward === "chest") setPendingChests(p => [...p, "boss"])
    else if (reward === "boost" && boostMin) { setBoosterActive(true); setBoosterEndTime(Date.now() + boostMin * 60000); setBoosterMultiplier(3) }
    setBossNextTime(Date.now() + BOSS_COOLDOWN_MS)
    setBossesDefeated(p => p + 1)
    setGamesPlayed(p => p + 1)
  }

  const handleCarrotGameReward = (multiplier: number, durationMin: number) => {
    setBoosterActive(true)
    setBoosterEndTime(Date.now() + durationMin * 60000)
    setBoosterMultiplier(multiplier)
    setGamesPlayed(p => p + 1)
  }

  const handleGamble = (bet: number, result: number, won: boolean) => {
    setCarrots(p => p - bet + result)
    if (won) setTotalCarrotsEarned(p => p + result)
  }

  const upgradeCarrotsPerClick = () => {
    const cost = getCarrotsPerClickUpgradeCost(carrotsPerClickLevel)
    if (!cost) return
    if (cost.type === "carrots" && carrots >= cost.amount) { setCarrots(p => p - cost.amount); setCarrotsPerClickLevel(p => p + 1) }
    else if (cost.type === "gt" && guineaTokens >= cost.amount) { setGuineaTokens(p => p - cost.amount); setCarrotsPerClickLevel(p => p + 1) }
  }

  const upgradeMaxEnergy = () => {
    const cost = getMaxEnergyUpgradeCost(maxEnergyLevel)
    if (!cost) return
    if (cost.type === "carrots" && carrots >= cost.amount) { setCarrots(p => p - cost.amount); setMaxEnergyLevel(p => p + 1) }
    else if (cost.type === "gt" && guineaTokens >= cost.amount) { setGuineaTokens(p => p - cost.amount); setMaxEnergyLevel(p => p + 1) }
  }

  const exchangeCarrotsForGT = () => {
    if (carrots < CARROT_TO_GT_RATE) return
    const gt = Math.floor(carrots / CARROT_TO_GT_RATE)
    setCarrots(p => p - gt * CARROT_TO_GT_RATE)
    setGuineaTokens(p => p + gt)
  }

  const buyOrUpgradeMiner = async (minerType: number) => {
    const existing = playerMiners.find(m => m.miner_type === minerType)
    const currentLevel = existing?.level || 0
    if (currentLevel >= 5) return
    const cost = getMinerCost(minerType, currentLevel + 1)
    if (guineaTokens < cost) return
    setGuineaTokens(p => p - cost)
    setPlayerMiners(existing
      ? playerMiners.map(m => m.miner_type === minerType ? { ...m, level: m.level + 1 } : m)
      : [...playerMiners, { miner_type: minerType, level: 1 }]
    )
    try { await fetch("/api/miners/buy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, minerType, newLevel: currentLevel + 1 }) }) } catch {}
  }

  const buyGTWithStars = async (gtAmount: number) => {
    if (isPurchasing || !tg.user) return
    setIsPurchasing(true)
    try {
      const res = await fetch("/api/buy-stars", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, gtAmount, currency: "XTR" }) })
      const data = await res.json()
      if (data.success) {
        let attempts = 0
        const poll = setInterval(async () => {
          attempts++
          const bal = await (await fetch(`/api/get-balance/${userId}`)).json()
          if (bal.guinea_tokens > guineaTokens) { setGuineaTokens(bal.guinea_tokens); setTelegramStars(bal.telegram_stars); clearInterval(poll) }
          if (attempts >= 40) clearInterval(poll)
        }, 3000)
      }
    } catch {} finally { setTimeout(() => setIsPurchasing(false), 3000) }
  }

  const loadLeaderboard = async (period: "daily" | "weekly" | "alltime") => {
    try {
      // First push current player score so they appear in the board
      fetch("/api/leaderboard/alltime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username: tg.user?.username || tg.user?.first_name || "Player", carrots, level }),
      }).catch(() => {})
      const res = await fetch(`/api/leaderboard/${period}`)
      const data = await res.json()
      setLeaderboard(data.data || [])
    } catch {}
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="mb-4 text-6xl animate-bounce">🐹</div>
          <div className="text-white text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  const activePig = getPigById(activePigId)
  const TABS = [
    { id: "main", icon: <HomeIcon className="w-5 h-5" />, label: "Главная" },
    { id: "bonuses", icon: <Gift className="w-5 h-5" />, label: "Бонусы" },
    { id: "games", icon: <Gamepad2 className="w-5 h-5" />, label: "Игры" },
    { id: "quests", icon: <ListTodo className="w-5 h-5" />, label: "Задания" },
    { id: "miners", icon: <Pickaxe className="w-5 h-5" />, label: "Майнеры" },
    { id: "upgrades", icon: <ArrowUpCircle className="w-5 h-5" />, label: "Апгрейды" },
    { id: "achievements", icon: <Trophy className="w-5 h-5" />, label: "Достиж." },
    { id: "friends", icon: <Users className="w-5 h-5" />, label: "Друзья" },
    { id: "shop", icon: <ShoppingBag className="w-5 h-5" />, label: "Магазин" },
    { id: "leaderboard", icon: <Crown className="w-5 h-5" />, label: "Топ" },
  ]

  const freeChestMinutes = Math.ceil(Math.max(0, freeChestNextTime - Date.now()) / 60000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white pb-36">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border-b border-purple-500/30 p-2">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span className="font-bold text-yellow-400">{guineaTokens.toFixed(2)} GT</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs">
              <span className="font-bold text-gray-300">Lvl {level}</span>
              <span className="text-gray-400"> {xp}/{xpNeeded} XP</span>
            </div>
            {streakDay > 1 && (
              <div
                className="flex items-center gap-1 bg-orange-900/40 rounded-full px-2 py-1 text-xs cursor-pointer"
                onClick={() => setShowDailyRewards(true)}
              >
                <span className="text-orange-400">🔥 {streakDay}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button size="sm" onClick={() => setShowDailyRewards(true)} className="bg-yellow-600 hover:bg-yellow-700 px-2 h-8" title="Ежедневная награда">
              <Gift className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={() => setShowLanguageModal(true)} className="bg-blue-600 hover:bg-blue-700 px-2 h-8">
              <Globe className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={() => setShowPigsModal(true)} className="bg-pink-600 hover:bg-pink-700 px-2 h-8">
              <img src={activePig?.icon || "/placeholder.svg"} alt="pig" className="w-5 h-5 rounded-full object-contain" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4 max-w-2xl">

        {activeTab === "main" && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="text-2xl font-bold text-orange-400">{carrots.toLocaleString()} 🥕</div>
              {totalIncomePerHour > 0 && (
                <Card className="bg-green-900/30 border-green-500/30 p-2">
                  <div className="text-xs text-gray-300">Пассивный доход</div>
                  <div className="text-base font-bold text-green-400">+{totalIncomePerHour.toFixed(4)} GT/час</div>
                </Card>
              )}

              {/* Chests quick access */}
              <div className="flex gap-2 justify-center flex-wrap">
                <ChestCard type="free" available={freeChestAvailable} nextFreeIn={freeChestMinutes} onOpen={openFreeChest} />
                <ChestCard type="premium" available={guineaTokens >= 5} gtCost={5} onOpen={openPremiumChest} />
                {pendingChests.length > 0 && (
                  <ChestCard type={pendingChests[0]} available={true} onOpen={() => setOpeningChest(pendingChests[0])} />
                )}
              </div>

              <button
                onClick={handleClick}
                disabled={energy < 1}
                className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 shadow-2xl mx-auto"
              >
                {activePig && <img src={activePig.icon || "/placeholder.svg"} alt={activePig.name[language]} className="w-4/5 h-4/5 object-contain" />}
              </button>
              <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-2">
                <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                <Progress value={(energy / maxEnergy) * 100} className="h-2 flex-1" />
                <span className="text-xs font-medium">{energy}/{maxEnergy}</span>
              </div>
              <p className="text-xs text-gray-400">
                +{carrotsPerClick * (boosterActive ? boosterMultiplier : 1)} 🥕 за тап
                {boosterActive && <span className="text-pink-400 ml-1">(x{boosterMultiplier} буст!)</span>}
              </p>
              {autoTapActive && <p className="text-xs text-green-400 animate-pulse">🤖 Авто-тап активен</p>}
            </div>
          </div>
        )}

        {activeTab === "bonuses" && (
          <BonusesTab
            wheelSpinsLeft={wheelSpinsLeft}
            carrotRewardClaimed={carrotRewardClaimed}
            energyRewardClaimed={energyRewardClaimed}
            autoTapActive={autoTapActive}
            boosterActive={boosterActive}
            autoTapEndTime={autoTapEndTime}
            boosterEndTime={boosterEndTime}
            onWheelSpin={handleWheelSpin}
            onWheelPrize={handleWheelPrize}
            onClaimCarrots={claimCarrots}
            onClaimEnergy={claimEnergy}
            onWheelAdGranted={() => {
              const n = wheelSpinsLeft + 1
              setWheelSpinsLeft(n)
              localStorage.setItem(`gpc_spins_${userId}`, String(n))
            }}
          />
        )}

        {activeTab === "games" && (
          <GamesTab
            carrots={carrots}
            bossAvailable={bossAvailable}
            bossNextTime={bossNextTime}
            freeGambleUsed={freeGambleUsed}
            onCarrotGameReward={handleCarrotGameReward}
            onGamble={handleGamble}
            onUseFreeGamble={() => { setFreeGambleUsed(true); localStorage.setItem(`gpc_freeGamble_${userId}`, "1") }}
            onBossVictory={handleBossVictory}
            onBossDefeat={() => {}}
            onPlinkoResult={(win, bet) => {
              setCarrots(p => p - bet + win)
              if (win > bet) setTotalCarrotsEarned(p => p + win)
              setGamesPlayed(p => p + 1)
            }}
          />
        )}

        {activeTab === "quests" && (
          <QuestsTab quests={quests} onClaim={handleQuestClaim} />
        )}

        {activeTab === "miners" && (
          <MinersTab playerMiners={playerMiners} guineaTokens={guineaTokens}
            totalIncomePerHour={totalIncomePerHour} language={language} onBuy={buyOrUpgradeMiner} />
        )}

        {activeTab === "upgrades" && (
          <UpgradesTab carrots={carrots} guineaTokens={guineaTokens}
            carrotsPerClickLevel={carrotsPerClickLevel} maxEnergyLevel={maxEnergyLevel}
            onUpgradeClick={upgradeCarrotsPerClick} onUpgradeEnergy={upgradeMaxEnergy}
            onExchange={exchangeCarrotsForGT} />
        )}

        {activeTab === "achievements" && (
          <AchievementsTab achievements={achievements} />
        )}

        {activeTab === "friends" && (
          <FriendsTab referralLink={referralLink} referralsCount={referralsCount} referralBonus={referralBonus}
            onCopy={() => navigator.clipboard.writeText(referralLink)}
            onShare={() => tg.isAvailable && window.open(`https://t.me/share/url?url=${referralLink}&text=Join%20Guinea%20Pig%20Clicker!`, "_blank")} />
        )}

        {activeTab === "shop" && <ShopTab isPurchasing={isPurchasing} onBuyGT={buyGTWithStars} />}

        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard} leaderboardPeriod={leaderboardPeriod}
            onPeriodChange={(p) => { setLeaderboardPeriod(p); loadLeaderboard(p) }} />
        )}
      </div>

      {/* Bottom nav — two rows of 5 */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-purple-500/30">
        <div className="max-w-2xl mx-auto px-1 py-1 space-y-0.5">
          {[TABS.slice(0, 5), TABS.slice(5)].map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-around">
              {row.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    if (tab.id === "leaderboard") loadLeaderboard(leaderboardPeriod)
                  }}
                  className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors text-[9px] ${
                    activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Rewards */}
      <DailyRewards
        open={showDailyRewards}
        onOpenChange={setShowDailyRewards}
        streakDay={streakDay}
        lastClaimDate={lastDailyClaimDate}
        onClaim={handleDailyRewardClaim}
      />

      {/* Chest Opener */}
      {openingChest && (
        <ChestOpener
          open={true}
          onOpenChange={(v) => { if (!v) setOpeningChest(null) }}
          chestType={openingChest}
          guineaTokens={guineaTokens}
          onReward={handleChestReward}
        />
      )}

      {/* Pig modal */}
      <Dialog open={showPigsModal} onOpenChange={setShowPigsModal}>
        <DialogContent onOpenChange={setShowPigsModal} className="bg-black/90 backdrop-blur-md border-purple-500/30 text-white max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Коллекция свинок</DialogTitle>
            <DialogDescription className="text-gray-400">Выберите активную морскую свинку</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 p-2">
            {PIGS.map((pig) => {
              const isUnlocked = unlockedPigs.includes(pig.id)
              const isActive = activePigId === pig.id
              return (
                <div key={pig.id}
                  onClick={() => isUnlocked && (setActivePigId(pig.id), setShowPigsModal(false))}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${isActive ? "border-purple-400 bg-purple-900/50" : isUnlocked ? "border-gray-600 bg-black/30 hover:border-gray-400" : "border-gray-700 bg-black/20 opacity-50 cursor-not-allowed"}`}
                >
                  <img src={pig.icon || "/placeholder.svg"} alt={pig.name[language]} className="w-16 h-16 mx-auto object-contain mb-1" />
                  <p className="text-xs font-semibold text-white">{pig.name[language]}</p>
                  {!isUnlocked && <p className="text-[10px] text-gray-400">Уровень {pig.unlockLevel}</p>}
                  {isActive && <p className="text-[10px] text-purple-400">Активна</p>}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Language modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent onOpenChange={setShowLanguageModal} className="bg-black/90 backdrop-blur-md border-purple-500/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Язык</DialogTitle>
            <DialogDescription className="text-gray-400">Выберите язык интерфейса</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 p-2">
            {[
              { code: "ru", name: "Русский" }, { code: "en", name: "English" },
              { code: "uk", name: "Українська" }, { code: "kk", name: "Қазақша" },
              { code: "de", name: "Deutsch" }, { code: "fr", name: "Français" },
              { code: "es", name: "Español" }, { code: "pt", name: "Português" },
              { code: "zh", name: "中文" }, { code: "ja", name: "日本語" },
              { code: "ko", name: "한국어" }, { code: "tr", name: "Türkçe" },
            ].map((lang) => (
              <button key={lang.code}
                onClick={() => { setLanguage(lang.code as Language); setShowLanguageModal(false) }}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${language === lang.code ? "border-purple-400 bg-purple-900/50 text-white" : "border-gray-600 bg-black/30 text-gray-300 hover:border-gray-400"}`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

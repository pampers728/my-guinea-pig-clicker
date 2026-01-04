"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
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
} from "lucide-react"
import { useTelegram } from "@/components/TelegramProvider"
import { useTranslation, type Language } from "@/lib/i18n"
import {
  PIGS,
  getPigById,
  calculateXPNeeded,
  getLevelRewards,
  getCurrentMaxEnergy,
  getCurrentCarrotsPerClick,
} from "@/lib/pigs"
// Dynamically import TonConnect to avoid SSR issues and potential runtime errors
const TonConnectModule: any = null
// </CHANGE> Removed direct import and dynamic import from here

interface TaskReward {
  carrots: number
  gt: number
}

interface Task {
  id: string
  title: string
  description: string
  type: string
  target: number
  reward: TaskReward
  progress: number
  completed: boolean
  claimed: boolean
}

interface MinerLevel {
  lvl: number
  priceGT: number
  priceStars: number
  incomePerHour: number
}

interface Miner {
  id: string
  name: string
  type: string
  level: number
  icon: string
  levels: MinerLevel[]
}

interface TaskProgress {
  clicks: number
  carrots_earned: number
  carrots_converted: number
  gt_earned: number
  gt_spent: number
  stars_earned: number
  stars_spent: number
  gt_packages_bought: number
  miners_bought: number
  mining_collected: number
  carrots_upgrades: number
  energy_upgrades: number
  total_gt_spent_upgrades: number
  friends_invited: number
  referral_bonuses: number
  carrots_from_friends: number
}

interface Friend {
  id: string
  name: string
  bonus: number
}

interface LeaderboardPlayer {
  rank: number
  username: string
  score: number
  avatar: string
}

const ALL_TASKS_POOL: Omit<Task, "progress" | "completed" | "claimed">[] = [
  {
    id: "clicks_1000",
    title: "Тапни 1000 раз",
    description: "Сделай 1000 кликов 🐹 за неделю",
    type: "clicks",
    target: 1000,
    reward: { carrots: 10000, gt: 0.1 },
  },
  {
    id: "clicks_5000",
    title: "Тапни 5000 раз",
    description: "Сделай 5000 кликов 🐹",
    type: "clicks",
    target: 5000,
    reward: { carrots: 50000, gt: 0.5 },
  },
  {
    id: "clicks_10000",
    title: "Тапни 10000 раз",
    description: "Сделай 10,000 кликов 🐹",
    type: "clicks",
    target: 10000,
    reward: { carrots: 100000, gt: 1 },
  },
  {
    id: "clicks_25000",
    title: "Тапни 25000 раз",
    description: "Сделай 25,000 кликов 🐹",
    type: "clicks",
    target: 25000,
    reward: { carrots: 250000, gt: 2.5 },
  },
  {
    id: "clicks_50000",
    title: "Тапни 50000 раз",
    description: "Сделай 50,000 кликов 🐹",
    type: "clicks",
    target: 50000,
    reward: { carrots: 500000, gt: 5 },
  },
  {
    id: "carrots_5000",
    title: "Накопи 5K морковок",
    description: "Накопи 5000 морковок",
    type: "carrots_earned",
    target: 5000,
    reward: { carrots: 5000, gt: 0.1 },
  },
  {
    id: "carrots_10000",
    title: "Накопи 10K морковок",
    description: "Накопи 10,000 морковок",
    type: "carrots_earned",
    target: 10000,
    reward: { carrots: 10000, gt: 0.2 },
  },
  {
    id: "carrots_50000",
    title: "Накопи 50K морковок",
    description: "Накопи 50,000 морковок",
    type: "carrots_earned",
    target: 50000,
    reward: { carrots: 50000, gt: 0.5 },
  },
  {
    id: "carrots_100000",
    title: "Накопи 100K морковок",
    description: "Накопи 100,000 морковок",
    type: "carrots_earned",
    target: 100000,
    reward: { carrots: 100000, gt: 1 },
  },
  {
    id: "convert_10000",
    title: "Конвертируй морковки",
    description: "Сконвертируй 10,000 морковок в GT",
    type: "carrots_converted",
    target: 10000,
    reward: { carrots: 0, gt: 0.5 },
  },
  {
    id: "gt_earn_50",
    title: "Заработай 50 GT",
    description: "Получи 50 GT за неделю",
    type: "gt_earned",
    target: 50,
    reward: { carrots: 100000, gt: 5 },
  },
  {
    id: "gt_earn_100",
    title: "Заработай 100 GT",
    description: "Получи 100 GT",
    type: "gt_earned",
    target: 100,
    reward: { carrots: 200000, gt: 10 },
  },
  {
    id: "gt_earn_250",
    title: "Заработай 250 GT",
    description: "Получи 250 GT",
    type: "gt_earned",
    target: 250,
    reward: { carrots: 500000, gt: 25 },
  },
  {
    id: "gt_spend_100",
    title: "Потрать 100 GT",
    description: "Потрать 100 GT на апгрейды",
    type: "gt_spent",
    target: 100,
    reward: { carrots: 200000, gt: 10 },
  },
  {
    id: "gt_spend_500",
    title: "Потрать 500 GT",
    description: "Потрать 500 GT на апгрейды",
    type: "gt_spent",
    target: 500,
    reward: { carrots: 1000000, gt: 50 },
  },
  {
    id: "stars_get_1",
    title: "Получи звезду",
    description: "Получи хотя бы 1 звезду ⭐ (донат/ивент)",
    type: "stars_earned",
    target: 1,
    reward: { carrots: 50000, gt: 1 },
  },
  {
    id: "stars_spend_10",
    title: "Потрать 10 звезд",
    description: "Потрать 10 звёзд ⭐",
    type: "stars_spent",
    target: 10,
    reward: { carrots: 100000, gt: 2 },
  },
  {
    id: "stars_spend_50",
    title: "Потрать 50 звезд",
    description: "Потрать 50 звёзд ⭐",
    type: "stars_spent",
    target: 50,
    reward: { carrots: 500000, gt: 10 },
  },
  {
    id: "stars_spend_100",
    title: "Потрать 100 звезд",
    description: "Потрать 100 звёзд ⭐",
    type: "stars_spent",
    target: 100,
    reward: { carrots: 1000000, gt: 20 },
  },
  {
    id: "stars_buy_gt",
    title: "Купи GT за звезды",
    description: "Купи хотя бы 1 пакет GT за звёзды",
    type: "gt_packages_bought",
    target: 1,
    reward: { carrots: 100000, gt: 5 },
  },
  {
    id: "miners_buy_1",
    title: "Купи майнера",
    description: "Купи 1 майнера",
    type: "miners_bought",
    target: 1,
    reward: { carrots: 50000, gt: 1 },
  },
  {
    id: "miners_buy_5",
    title: "Купи 5 майнеров",
    description: "Купи 5 майнеров",
    type: "miners_bought",
    target: 5,
    reward: { carrots: 250000, gt: 5 },
  },
  {
    id: "miners_buy_10",
    title: "Купи 10 майнеров",
    description: "Купи 10 майнеров",
    type: "miners_bought",
    target: 10,
    reward: { carrots: 500000, gt: 10 },
  },
  {
    id: "mining_collect_10",
    title: "Собери доход 10 раз",
    description: "Собери доход с майнеров 10 раз",
    type: "mining_collected",
    target: 10,
    reward: { carrots: 100000, gt: 2 },
  },
  {
    id: "mining_collect_50",
    title: "Собери доход 50 раз",
    description: "Собери доход с майнеров 50 раз",
    type: "mining_collected",
    target: 50,
    reward: { carrots: 500000, gt: 10 },
  },
  {
    id: "upgrade_carrots_5",
    title: "Улучши клик 5 раз",
    description: "Повышай «морковки за клик» 5 раз",
    type: "carrots_upgrades",
    target: 5,
    reward: { carrots: 100000, gt: 2 },
  },
  {
    id: "upgrade_energy_3",
    title: "Улучши энергию 3 раза",
    description: "Повышай «энергию» 3 раза",
    type: "energy_upgrades",
    target: 3,
    reward: { carrots: 100000, gt: 2 },
  },
  {
    id: "upgrade_energy_5",
    title: "Энергия до 5 уровня",
    description: "Повышай «энергию» до 5 уровня",
    type: "energy_level",
    target: 5,
    reward: { carrots: 200000, gt: 5 },
  },
  {
    id: "upgrade_carrots_10",
    title: "Клик до 10 уровня",
    description: "Повышай «морковки за клик» до 10 уровня",
    type: "carrots_level",
    target: 10,
    reward: { carrots: 500000, gt: 10 },
  },
  {
    id: "upgrade_total_500",
    title: "Апгрейдов на 500 GT",
    description: "Сделай апгрейдов на сумму 500 GT",
    type: "total_gt_spent_upgrades",
    target: 500,
    reward: { carrots: 1000000, gt: 50 },
  },
  {
    id: "friends_1",
    title: "Пригласи друга",
    description: "Пригласи 1 друга",
    type: "friends_invited",
    target: 1,
    reward: { carrots: 50000, gt: 1 },
  },
  {
    id: "friends_5",
    title: "Пригласи 5 друзей",
    description: "Пригласи 5 друзей",
    type: "friends_invited",
    target: 5,
    reward: { carrots: 250000, gt: 5 },
  },
  {
    id: "friends_10",
    title: "Пригласи 10 друзей",
    description: "Пригласи 10 друзей",
    type: "friends_invited",
    target: 10,
    reward: { carrots: 500000, gt: 10 },
  },
  {
    id: "friends_bonus_1",
    title: "Получи бонус от друга",
    description: "Получи хотя бы 1 бонус с рефералов",
    type: "referral_bonuses",
    target: 1,
    reward: { carrots: 50000, gt: 1 },
  },
  {
    id: "friends_carrots_1000",
    title: "1000 морковок от друзей",
    description: "Получи 1000 морковок от друзей",
    type: "carrots_from_friends",
    target: 1000,
    reward: { carrots: 100000, gt: 2 },
  },
]

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

  const [activeTab, setActiveTab] = useState("main")
  const [miners, setMiners] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"daily" | "weekly" | "alltime">("daily")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [referralLink, setReferralLink] = useState("")
  const [referralBonus, setReferralBonus] = useState(0)
  const [referralsCount, setReferralsCount] = useState(0)

  const exchangeCarrotsForGT = () => {
    const rate = 100000 // 100,000 морковок = 1 GT
    if (carrots >= rate) {
      const gtToAdd = Math.floor(carrots / rate)
      setCarrots((prev) => prev - gtToAdd * rate)
      setGuineaTokens((prev) => prev + gtToAdd)
    }
  }

  const [carrotsPerClickLevel, setCarrotsPerClickLevel] = useState(1)
  const [maxEnergyLevel, setMaxEnergyLevel] = useState(1)

  const upgradeCarrotsPerClick = () => {
    const cost = carrotsPerClickLevel * 100
    if (guineaTokens >= cost) {
      setGuineaTokens((prev) => prev - cost)
      setCarrotsPerClickLevel((prev) => prev + 1)
    }
  }

  const upgradeMaxEnergy = () => {
    const cost = maxEnergyLevel * 50
    if (guineaTokens >= cost) {
      setGuineaTokens((prev) => prev - cost)
      setMaxEnergyLevel((prev) => prev + 1)
    }
  }

  useEffect(() => {
    const userLang = tg.user?.language_code || "en"
    const supportedLang: Language = [
      "en",
      "ru",
      "uk",
      "kk",
      "pt",
      "be",
      "es",
      "de",
      "pl",
      "fr",
      "zh",
      "ja",
      "ko",
      "tr",
    ].includes(userLang)
      ? (userLang as Language)
      : "en"
    setLanguage(supportedLang)

    const userId = tg.user?.id || Date.now()
    setReferralLink(`https://t.me/GuineaPigClicker_bot?start=${userId}`)

    loadPlayerData()
    const startParam = tg.initDataUnsafe?.start_parameter
    if (startParam) {
      handleReferral(Number.parseInt(startParam))
    }
  }, [tg.user])

  // Обновляем интервал автосохранения
  useEffect(() => {
    const saveInterval = setInterval(() => {
      savePlayerData()
    }, 30000) // 30 секунд

    return () => clearInterval(saveInterval)
  }, [
    carrots,
    guineaTokens,
    telegramStars,
    level,
    xp,
    totalClicks,
    activePigId,
    unlockedPigs,
    miners,
    carrotsPerClickLevel,
    maxEnergyLevel,
  ])

  useEffect(() => {
    if (miners.length === 0) return
    const interval = setInterval(() => {
      const totalIncome = calculateTotalIncome()
      if (totalIncome > 0) {
        const incomePerSecond = totalIncome / 3600
        setGuineaTokens((prev) => prev + incomePerSecond)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [miners])

  useEffect(() => {
    const maxEnergy = getCurrentMaxEnergy(level)
    if (energy < maxEnergy) {
      const interval = setInterval(() => {
        setEnergy((prev) => Math.min(prev + 1, maxEnergy))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [energy, level])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("[v0] Loading timeout - forcing load complete")
        setIsLoading(false)
      }
    }, 5000)
    return () => clearTimeout(timeout)
  }, [isLoading])

  const loadPlayerData = async () => {
    const userId = tg.user?.id || Date.now()

    console.log("[v0] Loading player data for user:", userId)

    try {
      const res = await fetch("/api/player/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        console.error("[v0] Failed to load player:", res.status)
        setIsLoading(false)
        return
      }

      const data = await res.json()
      console.log("[v0] Player data loaded:", data)

      if (data.player) {
        setCarrots(data.player.score || 0)
        setGuineaTokens(data.player.guineaTokens || 0)
        setTelegramStars(data.player.telegramStars || 0)
        setLevel(data.player.level || 1)
        setXP(data.player.xp || 0)
        setTotalClicks(data.player.totalClicks || 0)
        setActivePigId(data.player.activePigId || "white_basic")
        setUnlockedPigs(data.player.pigs?.map((p: any) => p.id) || ["white_basic"])
        setReferralBonus(data.player.referralBonus || 0)
        setReferralsCount(data.player.referralsCount || 0)
        setMiners(data.player.miners || initializeMiners())
        // Загружаем апгрейды
        setCarrotsPerClickLevel(data.player.carrotsPerClickLevel || 1)
        setMaxEnergyLevel(data.player.maxEnergyLevel || 1)
      }
    } catch (error) {
      console.error("[v0] Failed to load player data:", error)
    } finally {
      console.log("[v0] Load complete, setting isLoading to false")
      setIsLoading(false)
    }
  }

  const savePlayerData = async () => {
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
          miners,
          // Сохраняем апгрейды
          carrotsPerClickLevel,
          maxEnergyLevel,
        }),
      })
      console.log("[v0] Player data saved successfully")
    } catch (error) {
      console.error("[v0] Failed to save player data:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReferral = async (referrerId: number) => {
    if (!tg.user || tg.user.id === referrerId) return
    try {
      await fetch("/api/referral/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tg.user.id, referrerId }),
      })
    } catch (error) {
      console.error("[v0] Failed to register referral:", error)
    }
  }

  const handleGuineaPigClick = () => {
    const clickCost = 1
    if (energy >= clickCost) {
      // Используем обновленную функцию получения морковок за клик
      const carrotsGained = getCurrentCarrotsPerClick(level) * carrotsPerClickLevel
      setCarrots((prev) => prev + carrotsGained)
      setEnergy((prev) => prev - clickCost)
      setTotalClicks((prev) => prev + 1)

      const xpGained = 1
      checkLevelUp(xpGained)
    }
  }

  const checkLevelUp = (xpGained: number) => {
    let newXP = xp + xpGained
    let newLevel = level
    let xpNeeded = calculateXPNeeded(newLevel)

    while (newXP >= xpNeeded) {
      newXP -= xpNeeded
      newLevel += 1
      xpNeeded = calculateXPNeeded(newLevel)

      const rewards = getLevelRewards(newLevel)
      if (rewards.pig) {
        unlockPig(rewards.pig)
        alert(`${t("level.reward")} ${newLevel}: ${getPigById(rewards.pig)?.name[language] || rewards.pig}!`)
      }
    }

    setXP(newXP)
    setLevel(newLevel)
  }

  const unlockPig = (pigId: string) => {
    if (!unlockedPigs.includes(pigId)) {
      setUnlockedPigs((prev) => [...prev, pigId])
    }
  }

  const initializeMiners = () => [
    {
      id: "farmer",
      name: "Farmer",
      icon: "👨‍🌾",
      level: 0,
      levels: [
        { priceGT: 10, priceStars: 5, incomePerHour: 0.001 },
        { priceGT: 50, priceStars: 25, incomePerHour: 0.005 },
        { priceGT: 200, priceStars: 100, incomePerHour: 0.02 },
        { priceGT: 800, priceStars: 400, incomePerHour: 0.08 },
        { priceGT: 3000, priceStars: 1500, incomePerHour: 0.3 },
      ],
    },
    {
      id: "gardener",
      name: "Gardener",
      icon: "🌱",
      level: 0,
      levels: [
        { priceGT: 25, priceStars: 12, incomePerHour: 0.002 },
        { priceGT: 100, priceStars: 50, incomePerHour: 0.01 },
        { priceGT: 400, priceStars: 200, incomePerHour: 0.04 },
        { priceGT: 1600, priceStars: 800, incomePerHour: 0.16 },
        { priceGT: 6000, priceStars: 3000, incomePerHour: 0.6 },
      ],
    },
  ]

  const calculateTotalIncome = () => {
    let total = 0
    miners.forEach((miner) => {
      if (miner.level > 0) {
        total += miner.levels[miner.level - 1].incomePerHour
      }
    })
    return total * (1 + referralBonus / 100)
  }

  const upgradeMiner = async (minerId: string, currency: "gt" | "stars") => {
    const miner = miners.find((m) => m.id === minerId)
    if (!miner || miner.level >= 5) return

    const nextLevel = miner.levels[miner.level]
    const cost = currency === "gt" ? nextLevel.priceGT : nextLevel.priceStars

    if (currency === "gt" && guineaTokens >= cost) {
      setGuineaTokens((prev) => prev - cost)
      setMiners((prev) => prev.map((m) => (m.id === minerId ? { ...m, level: m.level + 1 } : m)))
    } else if (currency === "stars" && telegramStars >= cost) {
      setTelegramStars((prev) => prev - cost)
      setMiners((prev) => prev.map((m) => (m.id === minerId ? { ...m, level: m.level + 1 } : m)))
    }
  }

  const buyGTWithStars = async (gtAmount: number) => {
    if (isPurchasing || !tg.user) return
    setIsPurchasing(true)

    try {
      const res = await fetch("/api/buy-stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tg.user.id,
          gtAmount,
          currency: "XTR",
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(t("shop.check_bot_message"))

        let attempts = 0
        const pollInterval = setInterval(async () => {
          attempts++
          const balanceRes = await fetch(`/api/get-balance/${tg.user.id}`)
          const balanceData = await balanceRes.json()

          if (balanceData.guineaTokens > guineaTokens) {
            setGuineaTokens(balanceData.guineaTokens)
            setTelegramStars(balanceData.telegramStars)
            clearInterval(pollInterval)
            alert(`✅ ${t("shop.purchase_success")} ${gtAmount} GT!`)
          }

          if (attempts >= 40) clearInterval(pollInterval)
        }, 3000)
      }
    } catch (error) {
      console.error("[v0] Purchase error:", error)
      alert(t("shop.purchase_error"))
    } finally {
      setTimeout(() => setIsPurchasing(false), 3000)
    }
  }

  const loadLeaderboard = async (period: "daily" | "weekly" | "alltime") => {
    try {
      const res = await fetch(`/api/leaderboard/${period}`)
      const data = await res.json()
      setLeaderboard(data.leaders || [])
    } catch (error) {
      console.error("[v0] Failed to load leaderboard:", error)
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    alert(t("friends.link_copied"))
  }

  const shareReferralLink = () => {
    if (tg.isAvailable) {
      const text = encodeURIComponent(`Join Guinea Pig Clicker! ${referralLink}`)
      window.open(`https://t.me/share/url?url=${referralLink}&text=${text}`, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">🐹</div>
          <div className="text-white text-lg">{t("game.loading")}</div>
        </div>
      </div>
    )
  }

  const activePig = getPigById(activePigId)
  const totalIncome = calculateTotalIncome()
  const xpNeeded = calculateXPNeeded(level)
  const maxEnergy = getCurrentMaxEnergy(level) + maxEnergyLevel * 100
  const carrotsPerClick = getCurrentCarrotsPerClick(level) * carrotsPerClickLevel

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white pb-20 safe-area-inset">
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border-b border-purple-500/30 p-2 sm:p-3">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs sm:text-sm">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="font-bold text-yellow-400">{guineaTokens.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs sm:text-sm">
              <span className="text-base sm:text-lg">⭐</span>
              <span className="font-bold text-blue-400">{telegramStars}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs sm:text-sm">
              <span className="text-base sm:text-lg">✨</span>
              <span className="font-bold text-indigo-400">
                {xp}/{xpNeeded}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs sm:text-sm">
              <span className="text-base sm:text-lg">🚀</span>
              <span className="font-bold text-gray-300">Lvl {level}</span>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button
              size="sm"
              onClick={() => setShowLanguageModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs px-2 sm:px-3 h-8"
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowPigsModal(true)}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-xs px-2 sm:px-3 h-8 flex items-center gap-1"
            >
              <img
                src={activePig?.icon || "/placeholder.svg"}
                alt="pig"
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
              />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowConvertModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-xs px-2 sm:px-3 h-8"
            >
              🥕→GT
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
        {activeTab === "main" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{carrots.toLocaleString()} 🥕</div>
              {totalIncome > 0 && (
                <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-500/30 p-2 sm:p-3">
                  <div className="text-xs sm:text-sm text-gray-300">{t("game.passive_income")}</div>
                  <div className="text-base sm:text-lg font-bold text-green-400">+{totalIncome.toFixed(4)} GT/ч</div>
                  {referralBonus > 0 && (
                    <div className="text-xs text-green-300">
                      +{referralBonus}% {t("game.referral_bonus")}
                    </div>
                  )}
                </Card>
              )}

              <button
                onClick={handleGuineaPigClick}
                disabled={energy < carrotsPerClick}
                className="w-full max-w-[280px] sm:max-w-xs aspect-square rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl mx-auto"
              >
                {activePig && (
                  <img
                    src={activePig.icon || "/placeholder.svg"}
                    alt={activePig.name[language]}
                    className="w-3/4 h-3/4 object-contain"
                  />
                )}
              </button>

              <div className="flex items-center justify-between bg-black/30 rounded-full p-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <div className="flex-1 mx-2 sm:mx-3">
                  <Progress value={(energy / maxEnergy) * 100} className="h-2" />
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {energy}/{maxEnergy}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                {t("game.tap_power")} = {carrotsPerClick} 🥕
              </p>
            </div>
          </div>
        )}

        {activeTab === "miners" && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">{t("tab.miners")}</h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {miners.map((miner) => {
                const currentLevel = miner.level > 0 ? miner.levels[miner.level - 1] : null
                const nextLevel = miner.level < 5 ? miner.levels[miner.level] : null
                return (
                  <Card
                    key={miner.id}
                    className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 p-3 sm:p-4"
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="text-2xl sm:text-3xl">{miner.icon}</div>
                          <div>
                            <h3 className="font-semibold text-white text-sm sm:text-base">{miner.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              Lvl {miner.level}
                            </Badge>
                          </div>
                        </div>
                        {currentLevel && (
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-semibold text-green-400">
                              +{currentLevel.incomePerHour.toFixed(4)} GT/ч
                            </div>
                          </div>
                        )}
                      </div>
                      {nextLevel && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            onClick={() => upgradeMiner(miner.id, "gt")}
                            disabled={guineaTokens < nextLevel.priceGT}
                            className="bg-yellow-600 hover:bg-yellow-700 text-xs sm:text-sm h-9 sm:h-10"
                          >
                            {nextLevel.priceGT} GT
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => upgradeMiner(miner.id, "stars")}
                            disabled={telegramStars < nextLevel.priceStars}
                            className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
                          >
                            {nextLevel.priceStars} ⭐
                          </Button>
                        </div>
                      )}
                      {miner.level >= 5 && (
                        <Badge className="w-full justify-center bg-gradient-to-r from-yellow-500 to-orange-500 text-xs sm:text-sm">
                          MAX
                        </Badge>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{t("friends.title")}</h2>
              <p className="text-xs sm:text-sm text-gray-400">{t("friends.description")}</p>
            </div>

            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 p-3 sm:p-4">
              <div className="space-y-3">
                <div className="text-xs sm:text-sm text-gray-300">{t("friends.link")}</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-black/30 text-white px-3 py-2 rounded text-xs sm:text-sm"
                  />
                  <Button onClick={copyReferralLink} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button onClick={shareReferralLink} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30 p-3 sm:p-4 text-center">
                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-white">{referralsCount}</div>
                <div className="text-xs sm:text-sm text-gray-400">{t("friends.count")}</div>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-yellow-500/30 p-3 sm:p-4 text-center">
                <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-white">+{referralBonus}%</div>
                <div className="text-xs sm:text-sm text-gray-400">{t("friends.bonus")}</div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "shop" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{t("tab.shop")}</h2>
              <p className="text-xs sm:text-sm text-gray-400">{t("shop.buy_gt_description")}</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">{t("shop.buy_for_stars")}</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-auto py-2 sm:py-3 flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-base"
                  >
                    <div className="font-bold">{pack.gt} GT</div>
                    <div className="text-[10px] sm:text-xs opacity-80">{pack.stars} ⭐</div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                {t("leaderboard.title")}
              </h2>
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                size="sm"
                onClick={() => {
                  setLeaderboardPeriod("daily")
                  loadLeaderboard("daily")
                }}
                variant={leaderboardPeriod === "daily" ? "default" : "outline"}
                className="text-xs sm:text-sm"
              >
                {t("leaderboard.daily")}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setLeaderboardPeriod("weekly")
                  loadLeaderboard("weekly")
                }}
                variant={leaderboardPeriod === "weekly" ? "default" : "outline"}
                className="text-xs sm:text-sm"
              >
                {t("leaderboard.weekly")}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setLeaderboardPeriod("alltime")
                  loadLeaderboard("alltime")
                }}
                variant={leaderboardPeriod === "alltime" ? "default" : "outline"}
                className="text-xs sm:text-sm"
              >
                {t("leaderboard.alltime")}
              </Button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {leaderboard.map((player, index) => (
                <Card
                  key={player.userId}
                  className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 p-2 sm:p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-lg sm:text-xl font-bold text-yellow-400">#{index + 1}</div>
                      <div>
                        <div className="font-semibold text-white text-sm sm:text-base">
                          {player.username || `Player ${player.userId}`}
                        </div>
                        <div className="text-xs text-gray-400">Lvl {player.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400 text-sm sm:text-base">
                        {player.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400">carrots</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "upgrades" && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">{t("tab.upgrades")}</h2>

            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{t("upgrade.carrots_per_click")}</h3>
                    <p className="text-xs text-gray-400">
                      {t("upgrade.current")}: {carrotsPerClick}
                    </p>
                  </div>
                  <Button
                    onClick={upgradeCarrotsPerClick}
                    disabled={guineaTokens < carrotsPerClickLevel * 100}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {carrotsPerClickLevel * 100} GT
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{t("upgrade.max_energy")}</h3>
                    <p className="text-xs text-gray-400">
                      {t("upgrade.current")}: {maxEnergy}
                    </p>
                  </div>
                  <Button
                    onClick={upgradeMaxEnergy}
                    disabled={guineaTokens < maxEnergyLevel * 50}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {maxEnergyLevel * 50} GT
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border-orange-500/30 p-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-white text-center">{t("exchange.title")}</h3>
                <p className="text-sm text-gray-300 text-center">{t("exchange.rate")}: 100,000 🥕 = 1 GT</p>
                <Button
                  onClick={exchangeCarrotsForGT}
                  disabled={carrots < 100000}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                >
                  {t("exchange.button")} ({Math.floor(carrots / 100000)} GT)
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-purple-500/30 safe-area-inset-bottom">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 bg-gray-900/50 backdrop-blur-sm p-2 rounded-t-2xl">
          <button
            onClick={() => setActiveTab("main")}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-colors text-[10px] sm:text-xs ${
              activeTab === "main" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t("tab.main")}</span>
          </button>

          <button
            onClick={() => setActiveTab("miners")}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-colors text-[10px] sm:text-xs ${
              activeTab === "miners" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Pickaxe className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t("tab.miners")}</span>
          </button>

          <button
            onClick={() => setActiveTab("upgrades")}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-colors text-[10px] sm:text-xs ${
              activeTab === "upgrades" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t("tab.upgrades")}</span>
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-colors text-[10px] sm:text-xs ${
              activeTab === "friends" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t("tab.friends")}</span>
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-colors text-[10px] sm:text-xs ${
              activeTab === "shop" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t("tab.shop")}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("leaderboard")
              loadLeaderboard(leaderboardPeriod)
            }}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-colors text-[10px] sm:text-xs ${
              activeTab === "leaderboard" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t("tab.leaderboard")}</span>
          </button>
        </div>
      </div>

      <Dialog open={showPigsModal} onOpenChange={setShowPigsModal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-purple-500/30 text-white max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">{t("pigs.collection")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 p-2">
            {PIGS.map((pig) => {
              const isUnlocked = unlockedPigs.includes(pig.id)
              const isActive = activePigId === pig.id
              return (
                <div
                  key={pig.id}
                  onClick={() => isUnlocked && setActivePigId(pig.id)}
                  className={`relative rounded-lg p-2 sm:p-3 cursor-pointer transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-purple-600 to-blue-600 ring-2 ring-yellow-400"
                      : isUnlocked
                        ? "bg-gradient-to-br from-purple-900/50 to-blue-900/30 hover:scale-105"
                        : "bg-black/50 opacity-50"
                  }`}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                      <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                  )}
                  <img
                    src={pig.icon || "/placeholder.svg"}
                    alt={pig.name[language]}
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="mt-2 text-center">
                    <div className="text-xs sm:text-sm font-semibold truncate">{pig.name[language]}</div>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-[10px] ${
                        pig.rarity === "LIMITED"
                          ? "bg-yellow-600"
                          : pig.rarity === "EVENT"
                            ? "bg-red-600"
                            : pig.rarity === "RARE"
                              ? "bg-purple-600"
                              : "bg-gray-600"
                      }`}
                    >
                      {pig.rarity}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-purple-500/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">{t("settings.language")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
              <Button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as Language)
                  setShowLanguageModal(false)
                }}
                className={`flex items-center gap-2 justify-start h-auto py-3 text-sm ${
                  language === lang.code ? "bg-purple-600" : "bg-black/30"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

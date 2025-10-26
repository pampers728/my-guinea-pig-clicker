"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Copy,
  Home,
  Zap,
  Pickaxe,
  Trophy,
  Users,
  Share2,
  UserPlus,
  Coins,
  CheckCircle,
  Heart,
  Youtube,
  Music,
  Info,
  ShoppingCart,
  Crown,
  Wallet,
} from "lucide-react"
import { TonConnect } from "@tonconnect/sdk"

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

export default function GuineaPigTapGame() {
  const [carrots, setCarrots] = useState<number>(0)
  const [guineaTokens, setGuineaTokens] = useState<number>(0)
  const [telegramStars, setTelegramStars] = useState<number>(0)
  const [carrotsPerClickLevel, setCarrotsPerClickLevel] = useState<number>(1)
  const [maxEnergyLevel, setMaxEnergyLevel] = useState<number>(1)
  const [energy, setEnergy] = useState<number>(1000)
  const [activeTab, setActiveTab] = useState<string>("main")
  const [referralCode, setReferralCode] = useState<string>("")
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false)
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false)
  const [showCryptoPaymentModal, setShowCryptoPaymentModal] = useState<boolean>(false)
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"daily" | "weekly" | "alltime">("daily")
  const [miningSecondsLeft, setMiningSecondsLeft] = useState<number>(60)
  const [lastMiningTime, setLastMiningTime] = useState<number>(Date.now())
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({
    clicks: 0,
    carrots_earned: 0,
    carrots_converted: 0,
    gt_earned: 0,
    gt_spent: 0,
    stars_earned: 0,
    stars_spent: 0,
    gt_packages_bought: 0,
    miners_bought: 0,
    mining_collected: 0,
    carrots_upgrades: 0,
    energy_upgrades: 0,
    total_gt_spent_upgrades: 0,
    friends_invited: 0,
    referral_bonuses: 0,
    carrots_from_friends: 0,
  })
  const [miners, setMiners] = useState<Miner[]>([
    {
      id: "baby_miner",
      name: "Baby Miner",
      type: "starter",
      level: 0,
      icon: "👶",
      levels: [
        { lvl: 1, priceGT: 25, priceStars: 50, incomePerHour: 0.002 },
        { lvl: 2, priceGT: 40, priceStars: 80, incomePerHour: 0.004 },
        { lvl: 3, priceGT: 60, priceStars: 120, incomePerHour: 0.006 },
        { lvl: 4, priceGT: 90, priceStars: 180, incomePerHour: 0.009 },
        { lvl: 5, priceGT: 120, priceStars: 240, incomePerHour: 0.012 },
      ],
    },
    {
      id: "carrot_miner",
      name: "Carrot Miner",
      type: "farm",
      level: 0,
      icon: "🥕",
      levels: [
        { lvl: 1, priceGT: 50, priceStars: 100, incomePerHour: 0.005 },
        { lvl: 2, priceGT: 70, priceStars: 140, incomePerHour: 0.008 },
        { lvl: 3, priceGT: 100, priceStars: 200, incomePerHour: 0.012 },
        { lvl: 4, priceGT: 150, priceStars: 300, incomePerHour: 0.018 },
        { lvl: 5, priceGT: 200, priceStars: 400, incomePerHour: 0.025 },
      ],
    },
    {
      id: "carrot_harvester",
      name: "Carrot Harvester",
      type: "farm",
      level: 0,
      icon: "🚜",
      levels: [
        { lvl: 1, priceGT: 100, priceStars: 200, incomePerHour: 0.015 },
        { lvl: 2, priceGT: 150, priceStars: 300, incomePerHour: 0.025 },
        { lvl: 3, priceGT: 220, priceStars: 440, incomePerHour: 0.038 },
        { lvl: 4, priceGT: 320, priceStars: 640, incomePerHour: 0.055 },
        { lvl: 5, priceGT: 450, priceStars: 900, incomePerHour: 0.075 },
      ],
    },
    {
      id: "mini_farm",
      name: "Mini Farm",
      type: "farm",
      level: 0,
      icon: "🏠",
      levels: [
        { lvl: 1, priceGT: 80, priceStars: 160, incomePerHour: 0.01 },
        { lvl: 2, priceGT: 120, priceStars: 240, incomePerHour: 0.018 },
        { lvl: 3, priceGT: 180, priceStars: 360, incomePerHour: 0.028 },
        { lvl: 4, priceGT: 270, priceStars: 540, incomePerHour: 0.04 },
        { lvl: 5, priceGT: 350, priceStars: 700, incomePerHour: 0.05 },
      ],
    },
    {
      id: "crystal_wheel",
      name: "Crystal Wheel",
      type: "magic",
      level: 0,
      icon: "💎",
      levels: [
        { lvl: 1, priceGT: 200, priceStars: 400, incomePerHour: 0.03 },
        { lvl: 2, priceGT: 300, priceStars: 600, incomePerHour: 0.05 },
        { lvl: 3, priceGT: 450, priceStars: 900, incomePerHour: 0.075 },
        { lvl: 4, priceGT: 650, priceStars: 1300, incomePerHour: 0.11 },
        { lvl: 5, priceGT: 900, priceStars: 1800, incomePerHour: 0.15 },
      ],
    },
    {
      id: "data_center",
      name: "Data Center",
      type: "infrastructure",
      level: 0,
      icon: "💾",
      levels: [
        { lvl: 1, priceGT: 150, priceStars: 300, incomePerHour: 0.02 },
        { lvl: 2, priceGT: 225, priceStars: 450, incomePerHour: 0.035 },
        { lvl: 3, priceGT: 340, priceStars: 680, incomePerHour: 0.055 },
        { lvl: 4, priceGT: 480, priceStars: 960, incomePerHour: 0.08 },
        { lvl: 5, priceGT: 600, priceStars: 1200, incomePerHour: 0.1 },
      ],
    },
    {
      id: "quantum_guinea",
      name: "Quantum Guinea",
      type: "advanced",
      level: 0,
      icon: "⚛️",
      levels: [
        { lvl: 1, priceGT: 350, priceStars: 700, incomePerHour: 0.06 },
        { lvl: 2, priceGT: 525, priceStars: 1050, incomePerHour: 0.1 },
        { lvl: 3, priceGT: 800, priceStars: 1600, incomePerHour: 0.15 },
        { lvl: 4, priceGT: 1200, priceStars: 2400, incomePerHour: 0.22 },
        { lvl: 5, priceGT: 1700, priceStars: 3400, incomePerHour: 0.3 },
      ],
    },
    {
      id: "galactic_farm",
      name: "Galactic Farm",
      type: "space",
      level: 0,
      icon: "🌌",
      levels: [
        { lvl: 1, priceGT: 500, priceStars: 1000, incomePerHour: 0.1 },
        { lvl: 2, priceGT: 750, priceStars: 1500, incomePerHour: 0.17 },
        { lvl: 3, priceGT: 1100, priceStars: 2200, incomePerHour: 0.25 },
        { lvl: 4, priceGT: 1650, priceStars: 3300, incomePerHour: 0.35 },
        { lvl: 5, priceGT: 2300, priceStars: 4600, incomePerHour: 0.5 },
      ],
    },
    {
      id: "ai_miner",
      name: "AI Miner",
      type: "ai",
      level: 0,
      icon: "🤖",
      levels: [
        { lvl: 1, priceGT: 800, priceStars: 1600, incomePerHour: 0.15 },
        { lvl: 2, priceGT: 1200, priceStars: 2400, incomePerHour: 0.25 },
        { lvl: 3, priceGT: 1800, priceStars: 3600, incomePerHour: 0.4 },
        { lvl: 4, priceGT: 2700, priceStars: 5400, incomePerHour: 0.6 },
        { lvl: 5, priceGT: 3800, priceStars: 7600, incomePerHour: 0.85 },
      ],
    },
    {
      id: "golden_reactor",
      name: "Golden Reactor",
      type: "energy",
      level: 0,
      icon: "⚡",
      levels: [
        { lvl: 1, priceGT: 1000, priceStars: 2000, incomePerHour: 0.2 },
        { lvl: 2, priceGT: 1500, priceStars: 3000, incomePerHour: 0.35 },
        { lvl: 3, priceGT: 2250, priceStars: 4500, incomePerHour: 0.55 },
        { lvl: 4, priceGT: 3400, priceStars: 6800, incomePerHour: 0.8 },
        { lvl: 5, priceGT: 4800, priceStars: 9600, incomePerHour: 1.1 },
      ],
    },
    {
      id: "afb_industry",
      name: "AFB Industry",
      type: "industrial",
      level: 0,
      icon: "🏭",
      levels: [
        { lvl: 1, priceGT: 1500, priceStars: 3000, incomePerHour: 0.3 },
        { lvl: 2, priceGT: 2250, priceStars: 4500, incomePerHour: 0.5 },
        { lvl: 3, priceGT: 3400, priceStars: 6800, incomePerHour: 0.75 },
        { lvl: 4, priceGT: 5000, priceStars: 10000, incomePerHour: 1.1 },
        { lvl: 5, priceGT: 7000, priceStars: 14000, incomePerHour: 1.5 },
      ],
    },
    {
      id: "inferno_core",
      name: "Inferno Core",
      type: "epic",
      level: 0,
      icon: "🔥",
      levels: [
        { lvl: 1, priceGT: 2000, priceStars: 4000, incomePerHour: 0.4 },
        { lvl: 2, priceGT: 3000, priceStars: 6000, incomePerHour: 0.7 },
        { lvl: 3, priceGT: 4500, priceStars: 9000, incomePerHour: 1.0 },
        { lvl: 4, priceGT: 6500, priceStars: 13000, incomePerHour: 1.5 },
        { lvl: 5, priceGT: 9000, priceStars: 18000, incomePerHour: 2.0 },
      ],
    },
    {
      id: "quantum_singularity",
      name: "Quantum Singularity",
      type: "legendary",
      level: 0,
      icon: "🌟",
      levels: [
        { lvl: 1, priceGT: 5000, priceStars: 10000, incomePerHour: 0.6 },
        { lvl: 2, priceGT: 5750, priceStars: 11500, incomePerHour: 1.0 },
        { lvl: 3, priceGT: 6500, priceStars: 13000, incomePerHour: 1.5 },
        { lvl: 4, priceGT: 7250, priceStars: 14500, incomePerHour: 2.2 },
        { lvl: 5, priceGT: 7500, priceStars: 15000, incomePerHour: 3.0 },
      ],
    },
  ])
  const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([])
  const [lastTaskRotation, setLastTaskRotation] = useState<number>(Date.now())
  const [friends, setFriends] = useState<Friend[]>([])
  const [leaderboardData, setLeaderboardData] = useState<{
    daily: LeaderboardPlayer[]
    weekly: LeaderboardPlayer[]
    alltime: LeaderboardPlayer[]
  }>({
    daily: [],
    weekly: [],
    alltime: [],
  })

  const [tonWallet, setTonWallet] = useState<any>(null)
  const [tonConnector, setTonConnector] = useState<TonConnect | null>(null)
  const [tonPaymentStatus, setTonPaymentStatus] = useState<string>("")

  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [telegramUser, setTelegramUser] = useState<any>(null)

  const selectRandomTasks = (): Task[] => {
    const shuffled = [...ALL_TASKS_POOL].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3)
    return selected.map((task) => ({
      ...task,
      progress: 0,
      completed: false,
      claimed: false,
    }))
  }

  const checkAndRotateTasks = () => {
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    const now = Date.now()
    if (now - lastTaskRotation >= oneWeek) {
      const newTasks = selectRandomTasks()
      setWeeklyTasks(newTasks)
      setLastTaskRotation(now)
      setTaskProgress({
        clicks: 0,
        carrots_earned: 0,
        carrots_converted: 0,
        gt_earned: 0,
        gt_spent: 0,
        stars_earned: 0,
        stars_spent: 0,
        gt_packages_bought: 0,
        miners_bought: 0,
        mining_collected: 0,
        carrots_upgrades: 0,
        energy_upgrades: 0,
        total_gt_spent_upgrades: 0,
        friends_invited: 0,
        referral_bonuses: 0,
        carrots_from_friends: 0,
      })
    }
  }

  useEffect(() => {
    const loadGameData = () => {
      try {
        // Load auth token from local storage
        const savedToken = localStorage.getItem("authToken")
        if (savedToken) {
          setAuthToken(savedToken)
          setIsAuthenticated(true)
        }

        const savedData = localStorage.getItem("guineaPigGameData")
        if (savedData) {
          const data = window.JSON ? window.JSON.parse(savedData) : JSON.parse(savedData)
          setCarrots(data.carrots || 0)
          setGuineaTokens(data.guineaTokens || 0)
          setTelegramStars(data.telegramStars || 0)
          setCarrotsPerClickLevel(data.carrotsPerClickLevel || 1)
          setMaxEnergyLevel(data.maxEnergyLevel || 1)
          setEnergy(data.energy || 1000)
          if (data.miners) setMiners(data.miners)
          if (data.weeklyTasks) setWeeklyTasks(data.weeklyTasks)
          if (data.friends) setFriends(data.friends)
          if (data.taskProgress) setTaskProgress(data.taskProgress)
          if (data.lastTaskRotation) setLastTaskRotation(data.lastTaskRotation)
          if (data.lastMiningTime) setLastMiningTime(data.lastMiningTime)
        }

        const parsedData = savedData ? (window.JSON ? window.JSON.parse(savedData) : JSON.JSON.parse(savedData)) : null
        if (!parsedData || !parsedData.weeklyTasks || parsedData.weeklyTasks.length === 0) {
          const initialTasks = selectRandomTasks()
          setWeeklyTasks(initialTasks)
          setLastTaskRotation(Date.now())
        }

        const savedReferralCode = localStorage.getItem("userReferralCode")
        if (savedReferralCode) {
          setReferralCode(savedReferralCode)
        } else {
          const newCode = generateReferralCode()
          setReferralCode(newCode)
          localStorage.setItem("userReferralCode", newCode)
        }
      } catch (error) {
        console.error("[v0] Error loading game data:", error)
      }
    }
    loadGameData()
    checkAndRotateTasks()
    authenticateUser()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const syncInterval = setInterval(syncDataWithServer, 30000)
      return () => clearInterval(syncInterval)
    }
  }, [isAuthenticated, authToken, carrots, guineaTokens, telegramStars, miners, taskProgress, weeklyTasks])

  useEffect(() => {
    const interval = setInterval(
      () => {
        checkAndRotateTasks()
      },
      60 * 60 * 1000,
    )
    return () => clearInterval(interval)
  }, [lastTaskRotation])

  useEffect(() => {
    const saveGameData = () => {
      try {
        const gameData = {
          carrots,
          guineaTokens,
          telegramStars,
          carrotsPerClickLevel,
          maxEnergyLevel,
          energy,
          miners,
          weeklyTasks,
          friends,
          taskProgress,
          lastTaskRotation,
          lastMiningTime,
          lastSaved: new Date().toISOString(),
        }
        const jsonString = window.JSON ? window.JSON.stringify(gameData) : JSON.stringify(gameData)
        localStorage.setItem("guineaPigGameData", jsonString)
      } catch (error) {
        console.error("[v0] Error saving game data:", error)
      }
    }
    const debounceTimer = setTimeout(saveGameData, 1000)
    return () => clearTimeout(debounceTimer)
  }, [
    carrots,
    guineaTokens,
    telegramStars,
    carrotsPerClickLevel,
    maxEnergyLevel,
    energy,
    miners,
    weeklyTasks,
    friends,
    taskProgress,
    lastTaskRotation,
    lastMiningTime,
  ])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const connector = new TonConnect({
          manifestUrl: "https://my-guinea-pig-clicker.vercel.app/tonconnect-manifest.json",
        })
        setTonConnector(connector)

        connector
          .restoreConnection()
          .then((wallet) => {
            if (wallet) {
              setTonWallet(wallet)
              console.log("[v0] TON wallet connected:", wallet)
            }
          })
          .catch((error) => {
            console.error("[v0] TON wallet connection error:", error)
          })
      } catch (error) {
        console.error("[v0] TON Connect initialization error:", error)
      }
    }
  }, [])

  const authenticateUser = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp
        const user = tg.initDataUnsafe?.user

        if (user) {
          setTelegramUser(user)

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              telegramId: user.id,
              username: user.username || `user${user.id}`,
              firstName: user.first_name || "",
              lastName: user.last_name || "",
              photoUrl: user.photo_url || "",
            }),
          })

          const data = await response.json()

          if (response.status === 503) {
            console.warn("[v0] Database not configured - playing in offline mode")
            setIsAuthenticated(false)
            return
          }

          if (data.success && data.token) {
            setAuthToken(data.token)
            setIsAuthenticated(true)
            localStorage.setItem("authToken", data.token)
            console.log("[v0] User authenticated:", data.user)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Authentication error:", error)
      setIsAuthenticated(false)
    }
  }

  const syncDataWithServer = async () => {
    if (!authToken || !isAuthenticated) return

    try {
      const gameData = {
        carrots,
        guineaTokens,
        telegramStars,
        carrotsPerClickLevel,
        maxEnergyLevel,
        totalClicks: taskProgress.clicks,
        level: Math.floor(guineaTokens / 100) + 1,
        miners,
        taskProgress,
        weeklyTasks,
      }

      const response = await fetch("/api/player/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(gameData),
      })

      if (response.status === 503) {
        console.warn("[v0] Database not configured - data not synced")
        return
      }

      console.log("[v0] Data synced with server")
    } catch (error) {
      console.error("[v0] Error syncing data:", error)
    }
  }

  const loadLeaderboard = async (period: "daily" | "weekly" | "alltime") => {
    try {
      const response = await fetch(`/api/leaderboard/${period}`)

      if (response.status === 503) {
        console.warn("[v0] Database not configured - leaderboard not available")
        return
      }

      const data = await response.json()

      if (data.success && data.data) {
        console.log(`[v0] Loaded ${period} leaderboard:`, data.data.length, "players")
        setLeaderboardData((prev) => ({
          ...prev,
          [period]: data.data,
        }))
      }
    } catch (error) {
      console.error("[v0] Error loading leaderboard:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadLeaderboard("daily")
      loadLeaderboard("weekly")
      loadLeaderboard("alltime")
    }
  }, [isAuthenticated])

  const updateTaskProgress = (type: string, amount = 1) => {
    setTaskProgress((prev) => {
      const newProgress = { ...prev }
      if (type in prev) {
        newProgress[type as keyof TaskProgress] = (prev[type as keyof TaskProgress] || 0) + amount
      }

      setWeeklyTasks((tasks) =>
        tasks.map((task) => {
          if (task.type === type) {
            const progressValue = type in newProgress ? newProgress[type as keyof TaskProgress] : 0
            const newTaskProgress = Math.min(task.target, progressValue)
            return {
              ...task,
              progress: newTaskProgress,
              completed: newTaskProgress >= task.target,
            }
          }
          if (task.type === "energy_level" && type === "energy_upgrades") {
            return {
              ...task,
              progress: maxEnergyLevel,
              completed: maxEnergyLevel >= task.target,
            }
          }
          if (task.type === "carrots_level" && type === "carrots_upgrades") {
            return {
              ...task,
              progress: carrotsPerClickLevel,
              completed: carrotsPerClickLevel >= task.target,
            }
          }
          return task
        }),
      )

      return newProgress
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(getCurrentMaxEnergy(), prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [maxEnergyLevel])

  useEffect(() => {
    const totalIncome = calculateTotalIncomePerHour()
    if (totalIncome === 0) return
    const now = Date.now()
    const timePassed = now - lastMiningTime
    const minutesPassed = Math.floor(timePassed / 60000)
    if (minutesPassed > 0) {
      const offlineIncome = (totalIncome / 60) * minutesPassed
      setGuineaTokens((prev) => prev + offlineIncome)
      updateTaskProgress("gt_earned", offlineIncome)
      updateTaskProgress("mining_collected", minutesPassed)
      setLastMiningTime(now)
    }
    const interval = setInterval(() => {
      setMiningSecondsLeft((prev) => {
        if (prev <= 1) {
          const incomePerMinute = totalIncome / 60
          setGuineaTokens((prevGT) => prevGT + incomePerMinute)
          updateTaskProgress("gt_earned", incomePerMinute)
          updateTaskProgress("mining_collected", 1)
          setLastMiningTime(Date.now())
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [miners, lastMiningTime])

  const generateReferralCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = "GP"
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const getCurrentCarrotsPerClick = (): number => carrotsPerClickLevel
  const getCurrentMaxEnergy = (): number => maxEnergyLevel * 1000

  const calculateTotalIncomePerHour = (): number => {
    return miners.reduce((total, miner) => {
      if (miner.level > 0) {
        const currentLevel = miner.levels[miner.level - 1]
        return total + currentLevel.incomePerHour
      }
      return total
    }, 0)
  }

  const handleTap = () => {
    const energyCost = 1
    const carrotsReward = getCurrentCarrotsPerClick()
    if (energy >= energyCost) {
      setCarrots((prev) => prev + carrotsReward)
      setEnergy((prev) => Math.max(0, prev - energyCost))
      updateTaskProgress("clicks", 1)
      updateTaskProgress("carrots_earned", carrotsReward)
    }
  }

  const getCarrotsUpgradeCost = (): number => {
    if (carrotsPerClickLevel >= 7) {
      return (carrotsPerClickLevel - 6) * 0.5
    }
    return carrotsPerClickLevel * 50000
  }

  const getEnergyUpgradeCost = (): number => {
    if (maxEnergyLevel >= 7) {
      return maxEnergyLevel * 1.0
    }
    return maxEnergyLevel * 100000
  }

  const upgradeCarrotsPerClick = () => {
    const cost = getCarrotsUpgradeCost()
    const isGTCost = carrotsPerClickLevel >= 7

    if (carrotsPerClickLevel >= 10) {
      alert("Достигнут максимальный уровень!")
      return
    }

    if (isGTCost) {
      if (guineaTokens < cost) {
        alert(`Недостаточно GT! Нужно: ${cost.toFixed(2)} GT, у вас: ${guineaTokens.toFixed(2)} GT`)
        return
      }
      setGuineaTokens((prev) => {
        if (prev < cost) return prev
        return prev - cost
      })
      setCarrotsPerClickLevel((prev) => prev + 1)
      updateTaskProgress("carrots_upgrades", 1)
      updateTaskProgress("gt_spent", cost)
      updateTaskProgress("total_gt_spent_upgrades", cost)
    } else {
      if (carrots < cost) {
        alert(`Недостаточно морковок! Нужно: ${cost.toLocaleString()} 🥕, у вас: ${carrots.toLocaleString()} 🥕`)
        return
      }
      setCarrots((prev) => {
        if (prev < cost) return prev
        return prev - cost
      })
      setCarrotsPerClickLevel((prev) => prev + 1)
      updateTaskProgress("carrots_upgrades", 1)
    }
  }

  const upgradeMaxEnergy = () => {
    const cost = getEnergyUpgradeCost()
    const isGTCost = maxEnergyLevel >= 7

    if (maxEnergyLevel >= 10) {
      alert("Достигнут максимальный уровень!")
      return
    }

    if (isGTCost) {
      if (guineaTokens < cost) {
        alert(`Недостаточно GT! Нужно: ${cost.toFixed(2)} GT, у вас: ${guineaTokens.toFixed(2)} GT`)
        return
      }
      setGuineaTokens((prev) => {
        if (prev < cost) return prev
        return prev - cost
      })
      setMaxEnergyLevel((prev) => prev + 1)
      setEnergy(getCurrentMaxEnergy() + 1000)
      updateTaskProgress("energy_upgrades", 1)
      updateTaskProgress("gt_spent", cost)
      updateTaskProgress("total_gt_spent_upgrades", cost)
    } else {
      if (carrots < cost) {
        alert(`Недостаточно морковок! Нужно: ${cost.toLocaleString()} 🥕, у вас: ${carrots.toLocaleString()} 🥕`)
        return
      }
      setCarrots((prev) => {
        if (prev < cost) return prev
        return prev - cost
      })
      setMaxEnergyLevel((prev) => prev + 1)
      setEnergy(getCurrentMaxEnergy() + 1000)
      updateTaskProgress("energy_upgrades", 1)
    }
  }

  const convertCarrots = () => {
    const rate = 250000
    if (carrots < rate) {
      alert(`Недостаточно морковок! Нужно минимум: ${rate.toLocaleString()} 🥕, у вас: ${carrots.toLocaleString()} 🥕`)
      return
    }

    const gtToAdd = Math.floor(carrots / rate)
    const carrotsToSpend = gtToAdd * rate

    setCarrots((prev) => {
      if (prev < carrotsToSpend) return prev
      return prev - carrotsToSpend
    })
    setGuineaTokens((prev) => prev + gtToAdd)
    setShowConvertModal(false)
    updateTaskProgress("carrots_converted", carrotsToSpend)
    updateTaskProgress("gt_earned", gtToAdd)
    alert(`Успешно конвертировано! Получено: ${gtToAdd} GT`)
  }

  const upgradeMiner = (minerId: string, currency: "gt" | "stars") => {
    const miner = miners.find((m) => m.id === minerId)
    if (!miner) return

    if (miner.level >= 5) {
      alert("Майнер уже на максимальном уровне!")
      return
    }

    const nextLevel = miner.levels[miner.level]

    if (currency === "gt") {
      if (guineaTokens < nextLevel.priceGT) {
        alert(`Недостаточно GT! Нужно: ${nextLevel.priceGT} GT, у вас: ${guineaTokens.toFixed(2)} GT`)
        return
      }

      setGuineaTokens((prev) => {
        if (prev < nextLevel.priceGT) {
          alert("Недостаточно GT!")
          return prev
        }
        return prev - nextLevel.priceGT
      })
      updateTaskProgress("gt_spent", nextLevel.priceGT)
    } else {
      if (telegramStars < nextLevel.priceStars) {
        alert(`Недостаточно звезд! Нужно: ${nextLevel.priceStars} ⭐, у вас: ${telegramStars} ⭐`)
        return
      }

      setTelegramStars((prev) => {
        if (prev < nextLevel.priceStars) {
          alert("Недостаточно звезд!")
          return prev
        }
        return prev - nextLevel.priceStars
      })
      updateTaskProgress("stars_spent", nextLevel.priceStars)
    }

    setMiners((prev) =>
      prev.map((m) => {
        if (m.id === minerId) {
          return { ...m, level: m.level + 1 }
        }
        return m
      }),
    )
    updateTaskProgress("miners_bought", 1)
  }

  const copyReferralLink = () => {
    const referralLink = `https://t.me/GuineaPigClicker_bot?start=${referralCode}`
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(referralLink)
        .then(() => alert("Реферальная ссылка скопирована!"))
        .catch(() => {
          const textArea = document.createElement("textarea")
          textArea.value = referralLink
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand("copy")
          document.body.removeChild(textArea)
          alert("Реферальная ссылка скопирована!")
        })
    }
  }

  const shareReferralLink = () => {
    const referralLink = `https://t.me/GuineaPigClicker_bot?start=${referralCode}`
    const text = `🐹 Присоединяйся к Guinea Pig Tap! ${referralLink}`
    if (navigator.share) {
      navigator
        .share({
          title: "Guinea Pig Tap Game",
          text: text,
          url: referralLink,
        })
        .catch(() => copyReferralLink())
    } else {
      copyReferralLink()
    }
  }

  const claimTaskReward = (taskId: string) => {
    setWeeklyTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.completed && !task.claimed) {
          if (task.reward.carrots > 0) {
            setCarrots((prevCarrots) => prevCarrots + task.reward.carrots)
          }
          if (task.reward.gt > 0) {
            setGuineaTokens((prevGT) => prevGT + task.reward.gt)
          }
          return { ...task, claimed: true }
        }
        return task
      }),
    )
  }

  const supportDeveloper = (stars: number) => {
    if (telegramStars < stars) {
      alert(`Недостаточно звезд! Нужно: ${stars} ⭐, у вас: ${telegramStars} ⭐`)
      return
    }

    setTelegramStars((prev) => {
      if (prev < stars) return prev
      return prev - stars
    })
    setShowSupportModal(false)
    updateTaskProgress("stars_spent", stars)
    alert("Спасибо за поддержку! ❤️")
  }

  const buyGTWithStars = (gtAmount: number, starsPrice: number) => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.openInvoice(
        {
          title: `Покупка ${gtAmount} GT`,
          description: `Получите ${gtAmount} Guinea Tokens за ${starsPrice} Telegram Stars`,
          currency: "XTR",
          prices: [{ label: `${gtAmount} GT`, amount: starsPrice }],
        },
        (status: string) => {
          if (status === "paid") {
            setGuineaTokens((prev) => prev + gtAmount)
            updateTaskProgress("gt_packages_bought", 1)
            updateTaskProgress("gt_earned", gtAmount)
            alert(`Успешно! Получено ${gtAmount} GT`)
          } else if (status === "cancelled") {
            alert("Покупка отменена")
          } else {
            alert("Ошибка при покупке")
          }
        },
      )
    } else {
      alert("Telegram WebApp API недоступен. Откройте игру через Telegram бота.")
    }
  }

  const connectTonWallet = async () => {
    if (!tonConnector) {
      alert("TON Connect не инициализирован. Попробуйте обновить страницу.")
      return
    }

    try {
      const walletConnectionSource = {
        universalLink: "https://app.tonkeeper.com/ton-connect",
        bridgeUrl: "https://bridge.tonapi.io/bridge",
      }

      const connectedWallet = await tonConnector.connect(walletConnectionSource)
      setTonWallet(connectedWallet)
      console.log("[v0] TON wallet connected successfully:", connectedWallet)
      alert("✅ TON кошелек успешно подключен!")
    } catch (error) {
      console.error("[v0] Error connecting TON wallet:", error)
      alert("❌ Ошибка подключения кошелька. Убедитесь что у вас установлен Tonkeeper или другой TON кошелек.")
    }
  }

  const disconnectTonWallet = async () => {
    if (tonConnector) {
      try {
        await tonConnector.disconnect()
        setTonWallet(null)
        console.log("[v0] TON wallet disconnected")
        alert("TON кошелек отключен")
      } catch (error) {
        console.error("[v0] Error disconnecting TON wallet:", error)
      }
    }
  }

  const buyGTWithTON = async (gtAmount: number, tonAmount: number) => {
    if (!tonWallet) {
      await connectTonWallet()
      return
    }

    if (!tonConnector) {
      alert("TON Connect не инициализирован")
      return
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: "UQATdZnXCLh_2eZgKGNDwlA-Y0lFMsqF3SgdPgfjKPOPstLn",
            amount: (tonAmount * 1e9).toString(),
          },
        ],
      }

      await tonConnector.sendTransaction(transaction)

      setTimeout(async () => {
        try {
          const response = await fetch("/api/checkPayment")
          const data = await response.json()

          if (data.success) {
            setGuineaTokens((prev) => prev + gtAmount)
            updateTaskProgress("gt_earned", gtAmount)
            alert(`✅ Оплата получена! Начислено ${gtAmount} GT`)
          } else {
            alert("⏳ Транзакция отправлена. Проверка платежа может занять несколько минут.")
          }
        } catch (error) {
          console.error("[v0] Error checking payment:", error)
          alert("⏳ Транзакция отправлена. GT будут начислены после подтверждения.")
        }
      }, 5000)
    } catch (error) {
      console.error("[v0] Error sending TON transaction:", error)
      alert("❌ Ошибка отправки транзакции")
    }
  }

  const totalIncome = calculateTotalIncomePerHour()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white pb-24">
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border-b border-purple-500/30 p-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1.5">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-sm">{guineaTokens.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1.5">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-blue-400 text-sm">{telegramStars}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowSupportModal(true)}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-xs px-3"
            >
              <Heart className="w-3 h-3 mr-1" />
              Помощь
            </Button>
            <Button
              size="sm"
              onClick={() => setShowConvertModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-xs px-3"
            >
              🥕→GT
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === "main" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-orange-400">{carrots.toLocaleString()} 🥕</div>
              {totalIncome > 0 && (
                <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-500/30 p-3">
                  <div className="text-sm text-gray-300">Пассивный доход</div>
                  <div className="text-lg font-bold text-green-400">+{totalIncome.toFixed(4)} GT/час</div>
                  <div className="text-xs text-gray-400">+{(totalIncome / 60).toFixed(6)} GT/мин</div>
                </Card>
              )}
              <div
                className="w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center cursor-pointer transform transition-transform active:scale-95 shadow-2xl"
                onClick={handleTap}
              >
                <img
                  src="/cute-guinea-pig-with-glasses-in-business-suit.jpg"
                  alt="Guinea Pig"
                  className="w-48 h-48 rounded-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between bg-black/30 rounded-full p-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div className="flex-1 mx-3">
                  <Progress value={(energy / getCurrentMaxEnergy()) * 100} className="h-2" />
                </div>
                <span className="text-sm font-medium">
                  {energy}/{getCurrentMaxEnergy()}
                </span>
              </div>
              <p className="text-sm text-gray-400">Тап = {getCurrentCarrotsPerClick()} 🥕</p>
            </div>
          </div>
        )}

        {activeTab === "upgrade" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Прокачка</h2>
            </div>
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border-orange-500/30 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Морковки за клик</h3>
                      <div className="text-sm text-gray-400">Уровень {carrotsPerClickLevel}/10</div>
                    </div>
                    <div className="text-lg font-bold text-orange-400">{getCurrentCarrotsPerClick()} 🥕</div>
                  </div>
                  <Progress value={(carrotsPerClickLevel / 10) * 100} className="h-2" />
                  {carrotsPerClickLevel < 10 ? (
                    <Button
                      onClick={upgradeCarrotsPerClick}
                      disabled={
                        carrotsPerClickLevel >= 7
                          ? guineaTokens < getCarrotsUpgradeCost()
                          : carrots < getCarrotsUpgradeCost()
                      }
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Улучшить за {getCarrotsUpgradeCost().toLocaleString()} {carrotsPerClickLevel >= 7 ? "GT" : "🥕"}
                    </Button>
                  ) : (
                    <Badge className="w-full justify-center bg-gradient-to-r from-orange-500 to-red-500">МАКС</Badge>
                  )}
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-yellow-500/30 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Максимальная энергия</h3>
                      <div className="text-sm text-gray-400">Уровень {maxEnergyLevel}/10</div>
                    </div>
                    <div className="text-lg font-bold text-yellow-400">{getCurrentMaxEnergy()}</div>
                  </div>
                  <Progress value={(maxEnergyLevel / 10) * 100} className="h-2" />
                  {maxEnergyLevel < 10 ? (
                    <Button
                      onClick={upgradeMaxEnergy}
                      disabled={
                        maxEnergyLevel >= 7 ? guineaTokens < getEnergyUpgradeCost() : carrots < getEnergyUpgradeCost()
                      }
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      Улучшить за {getEnergyUpgradeCost().toLocaleString()} {maxEnergyLevel >= 7 ? "GT" : "🥕"}
                    </Button>
                  ) : (
                    <Badge className="w-full justify-center bg-gradient-to-r from-yellow-500 to-orange-500">МАКС</Badge>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "mine" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Майнеры</h2>
              <p className="text-sm text-gray-400">Покупайте майнеров для пассивного дохода GT</p>
            </div>
            {totalIncome > 0 ? (
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-300">Майнинг активен</div>
                      <div className="text-2xl font-bold text-green-400">+{totalIncome.toFixed(4)} GT/час</div>
                      <div className="text-xs text-gray-400">+{(totalIncome / 60).toFixed(6)} GT/мин</div>
                    </div>
                    <Pickaxe className="w-12 h-12 text-green-400 animate-pulse" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>До следующего начисления</span>
                    <span className="font-mono text-green-400">{miningSecondsLeft}с</span>
                  </div>
                  <Progress value={((60 - miningSecondsLeft) / 60) * 100} className="h-3" />
                </div>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border-orange-500/30 p-4">
                <div className="text-center space-y-2">
                  <Pickaxe className="w-12 h-12 text-orange-400 mx-auto" />
                  <div className="text-lg font-semibold text-white">Майнеры не активны</div>
                  <div className="text-sm text-gray-400">
                    Купите первого майнера ниже чтобы начать зарабатывать GT автоматически!
                  </div>
                </div>
              </Card>
            )}
            <div className="grid grid-cols-1 gap-4">
              {miners.map((miner) => {
                const currentLevel = miner.level > 0 ? miner.levels[miner.level - 1] : null
                const nextLevel = miner.level < 5 ? miner.levels[miner.level] : null
                return (
                  <Card
                    key={miner.id}
                    className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{miner.icon}</div>
                          <div>
                            <h3 className="font-semibold text-white">{miner.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              Уровень {miner.level}
                            </Badge>
                          </div>
                        </div>
                        {currentLevel && (
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-400">
                              +{currentLevel.incomePerHour.toFixed(4)} GT/ч
                            </div>
                          </div>
                        )}
                      </div>
                      {nextLevel && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => upgradeMiner(miner.id, "gt")}
                            disabled={guineaTokens < nextLevel.priceGT}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                          >
                            {nextLevel.priceGT} GT
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => upgradeMiner(miner.id, "stars")}
                            disabled={telegramStars < nextLevel.priceStars}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {nextLevel.priceStars} ⭐
                          </Button>
                        </div>
                      )}
                      {miner.level >= 5 && (
                        <Badge className="w-full justify-center bg-gradient-to-r from-yellow-500 to-orange-500">
                          МАКС
                        </Badge>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Еженедельные задания</h2>
              <p className="text-xs text-gray-400">Обновляются каждую неделю</p>
            </div>
            <div className="space-y-4">
              {weeklyTasks.map((task) => (
                <Card
                  key={task.id}
                  className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{task.title}</h3>
                        <p className="text-sm text-gray-400">{task.description}</p>
                      </div>
                      {task.completed && <CheckCircle className="w-6 h-6 text-green-400" />}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Прогресс</span>
                        <span className="text-white">
                          {task.progress}/{task.target}
                        </span>
                      </div>
                      <Progress value={(task.progress / task.target) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        {task.reward.carrots > 0 && (
                          <span className="text-orange-400">+{task.reward.carrots.toLocaleString()} 🥕</span>
                        )}
                        {task.reward.gt > 0 && <span className="text-yellow-400">+{task.reward.gt} GT</span>}
                      </div>
                      <Button
                        size="sm"
                        disabled={!task.completed || task.claimed}
                        onClick={() => claimTaskReward(task.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {task.claimed ? "Получено" : task.completed ? "Забрать" : "В процессе"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Пригласить друзей</h2>
              <p className="text-gray-400">Получай 10% от заработка друзей!</p>
            </div>
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/30 border-purple-500/30 p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Твоя реферальная ссылка</h3>
                <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                  <div className="text-xs text-gray-400 mb-1">Код:</div>
                  <div className="text-lg font-mono text-purple-300">{referralCode}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyReferralLink} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать
                  </Button>
                  <Button onClick={shareReferralLink} variant="outline" className="border-purple-500/50 bg-transparent">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30 p-4 text-center">
                <UserPlus className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{friends.length}</div>
                <div className="text-sm text-gray-400">Друзей</div>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-yellow-500/30 p-4 text-center">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Бонус</div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "shop" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Магазин</h2>
              <p className="text-sm text-gray-400">Покупайте GT за Telegram Stars или TON</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Покупка за Telegram Stars</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { gt: 10, stars: 20 },
                  { gt: 25, stars: 50 },
                  { gt: 50, stars: 100 },
                  { gt: 100, stars: 200 },
                  { gt: 250, stars: 500 },
                  { gt: 500, stars: 1000 },
                ].map((pack) => (
                  <Card
                    key={pack.gt}
                    className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-blue-500/30 p-4"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-yellow-400">{pack.gt} GT</div>
                      <div className="text-sm text-gray-400">{pack.stars} ⭐</div>
                      <Button
                        onClick={() => buyGTWithStars(pack.gt, pack.stars)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Купить
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Покупка за TON</h3>

                {tonWallet && (
                  <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border-blue-500/30 p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400">Подключен кошелек</div>
                        <div className="text-xs font-mono text-blue-300">
                          {tonWallet.account?.address?.slice(0, 8)}...{tonWallet.account?.address?.slice(-6)}
                        </div>
                      </div>
                      <Button size="sm" onClick={disconnectTonWallet} variant="outline">
                        Отключить
                      </Button>
                    </div>
                  </Card>
                )}

                {tonPaymentStatus && (
                  <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-yellow-500/30 p-4 mb-4">
                    <div className="text-center text-yellow-300">{tonPaymentStatus}</div>
                  </Card>
                )}

                <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border-cyan-500/30 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-8 h-8 text-cyan-400" />
                      <div>
                        <h4 className="font-semibold text-white">Оплата TON</h4>
                        <p className="text-sm text-gray-400">Подключите TON кошелек и купите GT</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">Курс: 1 TON = 100 GT</div>
                      <div className="text-xs text-gray-400">
                        Поддерживаются: Tonkeeper, Wallet, Telegram Wallet и другие
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { gt: 10, ton: 0.1 },
                        { gt: 25, ton: 0.25 },
                        { gt: 50, ton: 0.5 },
                        { gt: 100, ton: 1.0 },
                        { gt: 250, ton: 2.5 },
                        { gt: 500, ton: 5.0 },
                      ].map((pack) => (
                        <Button
                          key={pack.gt}
                          onClick={() => buyGTWithTON(pack.gt, pack.ton)}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-auto py-3 flex flex-col gap-1"
                        >
                          <div className="text-lg font-bold">{pack.gt} GT</div>
                          <div className="text-xs opacity-80">{pack.ton} TON</div>
                        </Button>
                      ))}
                    </div>

                    {!tonWallet && (
                      <div className="text-center text-sm text-gray-400 mt-2">
                        Нажмите на любую кнопку выше чтобы подключить кошелек
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Таблица лидеров
              </h2>
              <p className="text-sm text-gray-400">Топ 100 игроков</p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                onClick={() => {
                  setLeaderboardPeriod("daily")
                  loadLeaderboard("daily")
                }}
                className={
                  leaderboardPeriod === "daily" ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 hover:bg-gray-600"
                }
              >
                День
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setLeaderboardPeriod("weekly")
                  loadLeaderboard("weekly")
                }}
                className={
                  leaderboardPeriod === "weekly" ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 hover:bg-gray-600"
                }
              >
                Неделя
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setLeaderboardPeriod("alltime")
                  loadLeaderboard("alltime")
                }}
                className={
                  leaderboardPeriod === "alltime"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }
              >
                Все время
              </Button>
            </div>

            <div className="space-y-2">
              {leaderboardData[leaderboardPeriod].slice(0, 10).map((player) => (
                <Card
                  key={player.rank}
                  className={`p-4 ${
                    player.rank === 1
                      ? "bg-gradient-to-r from-yellow-900/50 to-orange-900/30 border-yellow-500/50"
                      : player.rank === 2
                        ? "bg-gradient-to-r from-gray-700/50 to-gray-600/30 border-gray-400/50"
                        : player.rank === 3
                          ? "bg-gradient-to-r from-orange-900/50 to-red-900/30 border-orange-700/50"
                          : "bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-2xl font-bold ${
                          player.rank === 1
                            ? "text-yellow-400"
                            : player.rank === 2
                              ? "text-gray-300"
                              : player.rank === 3
                                ? "text-orange-400"
                                : "text-gray-400"
                        }`}
                      >
                        #{player.rank}
                      </div>
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <div className="font-semibold text-white">{player.username}</div>
                        <div className="text-sm text-gray-400">{player.score.toLocaleString()} GT</div>
                      </div>
                    </div>
                    {player.rank <= 3 && <Crown className="w-6 h-6 text-yellow-400" />}
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" className="border-purple-500/50 bg-transparent">
                Показать больше
              </Button>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🐹</div>
              <h2 className="text-2xl font-bold text-white">Guinea Pig Tap Game</h2>
              <p className="text-gray-400">Тапай, зарабатывай, развивайся!</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Следите за нами</h3>
              <a
                href="https://youtube.com/@guaniapigclicker?si=AG0Gnkv4PmXgmZra"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="bg-gradient-to-br from-red-900/30 to-pink-900/20 border-red-500/30 p-4 hover:border-red-500/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">YouTube</h4>
                      <p className="text-sm text-gray-400">Смотрите наши видео</p>
                    </div>
                  </div>
                </Card>
              </a>
              <a href="https://tiktok.com/@guania.pig.clicke" target="_blank" rel="noopener noreferrer">
                <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border-cyan-500/30 p-4 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">TikTok</h4>
                      <p className="text-sm text-gray-400">Подписывайтесь</p>
                    </div>
                  </div>
                </Card>
              </a>
            </div>
            <Card className="bg-gradient-to-br from-pink-900/30 to-purple-900/20 border-pink-500/30 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-400" />
                <h3 className="text-lg font-semibold text-white">Поддержать автора</h3>
              </div>
              <p className="text-gray-300 text-sm">Помогите в развитии проекта!</p>
              <Button
                onClick={() => setShowSupportModal(true)}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                <Heart className="w-4 h-4 mr-2" />
                Поддержать за Stars
              </Button>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500/50">
          <DialogHeader>
            <DialogTitle className="text-white">Конвертировать Carrots в GT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-300">Курс: 250,000 🥕 = 1 GT</p>
              <p className="text-sm text-gray-400">У вас: {carrots.toLocaleString()} 🥕</p>
              <p className="text-sm text-gray-400">Получите: {Math.floor(carrots / 250000)} GT</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={convertCarrots}
                disabled={carrots < 250000}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Конвертировать
              </Button>
              <Button variant="outline" onClick={() => setShowConvertModal(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
        <DialogContent className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500/50">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Поддержать разработчика
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg text-gray-300 mb-4">Выберите сумму</div>
              <div className="text-sm text-gray-400">Ваши Stars: {telegramStars} ⭐</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 5, 10, 20, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => supportDeveloper(amount)}
                  disabled={telegramStars < amount}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-12 text-base font-bold"
                >
                  {amount} ⭐
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCryptoPaymentModal} onOpenChange={setShowCryptoPaymentModal}>
        <DialogContent className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500/50">
          <DialogHeader>
            <DialogTitle className="text-white">Инструкция по оплате USDT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <strong className="text-white">Шаг 1:</strong> Отправьте USDT (ERC-20) на адрес:
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
                <div className="font-mono text-green-300 break-all text-xs">
                  0x2482E6c61FbB294dF84502693700798131CEFCDD
                </div>
              </div>
              <div>
                <strong className="text-white">Шаг 2:</strong> Сохраните хэш транзакции (TX Hash)
              </div>
              <div>
                <strong className="text-white">Шаг 3:</strong> Свяжитесь с поддержкой через Telegram бота
                @GuineaPigClicker_bot и отправьте:
              </div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Хэш транзакции</li>
                <li>Сумму USDT</li>
                <li>Ваш реферальный код: {referralCode}</li>
              </ul>
              <div>
                <strong className="text-white">Шаг 4:</strong> Дождитесь подтверждения (обычно 5-15 минут)
              </div>
              <div className="text-yellow-400">
                <strong>Курс:</strong> 1 USDT = 10 GT
              </div>
            </div>
            <Button
              onClick={() => setShowCryptoPaymentModal(false)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Понятно
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-purple-500/30 safe-area-inset-bottom">
        <div className="grid grid-cols-8 gap-1 p-2">
          <button
            onClick={() => setActiveTab("main")}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "main" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Home className={`w-5 h-5 ${activeTab === "main" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">Главная</span>
          </button>
          <button
            onClick={() => setActiveTab("upgrade")}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "upgrade" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Zap className={`w-5 h-5 ${activeTab === "upgrade" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">Прокачка</span>
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "mine" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Pickaxe className={`w-5 h-5 ${activeTab === "mine" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">Майнинг</span>
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "tasks" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Trophy className={`w-5 h-5 ${activeTab === "tasks" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">Задания</span>
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "friends" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Users className={`w-5 h-5 ${activeTab === "friends" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">Друзья</span>
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "shop" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <ShoppingCart className={`w-5 h-5 ${activeTab === "shop" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">Магазин</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("leaderboard")
              if (!leaderboardData.daily.length) loadLeaderboard("daily")
            }}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "leaderboard" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Crown className={`w-5 h-5 ${activeTab === "leaderboard" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">Лидеры</span>
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${activeTab === "about" ? "bg-purple-600/30 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Info className={`w-5 h-5 ${activeTab === "about" ? "text-purple-400" : ""}`} />
            <span className="text-[10px] font-medium leading-tight text-center">О нас</span>
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Trophy, ShoppingCart, Pickaxe, HomeIcon } from "lucide-react"

interface TaskProgress {
  id: string
  progress: number
  completed: boolean
  claimed: boolean
}

interface Miner {
  id: string
  name: string
  icon: string
  baseIncome: number
  basePrice: number
  level: number
  owned: number
}

interface GameState {
  carrots: number
  gt: number
  stars: number
  clicks: number
  energy: number
  maxEnergy: number
  clicksPerTap: number
  referrals: number
  level: number
  taskProgress: Record<string, TaskProgress>
  miners: Record<string, Miner>
}

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    carrots: 0,
    gt: 0,
    stars: 0,
    clicks: 0,
    energy: 500,
    maxEnergy: 500,
    clicksPerTap: 1,
    referrals: 0,
    level: 1,
    taskProgress: {},
    miners: {
      baby: { id: "baby", name: "Baby Miner", icon: "🐹", baseIncome: 5, basePrice: 25, level: 0, owned: 0 },
      carrot: { id: "carrot", name: "Carrot Harvester", icon: "🥕", baseIncome: 15, basePrice: 50, level: 0, owned: 0 },
      crystal: { id: "crystal", name: "Crystal Wheel", icon: "💎", baseIncome: 30, basePrice: 100, level: 0, owned: 0 },
      quantum: { id: "quantum", name: "Quantum Guinea", icon: "⚛️", baseIncome: 50, basePrice: 200, level: 0, owned: 0 },
      galactic: {
        id: "galactic",
        name: "Galactic Farm",
        icon: "🌌",
        baseIncome: 75,
        basePrice: 500,
        level: 0,
        owned: 0,
      },
      ai: { id: "ai", name: "AI Miner", icon: "🤖", baseIncome: 100, basePrice: 1000, level: 0, owned: 0 },
      golden: {
        id: "golden",
        name: "Golden Reactor",
        icon: "⚡",
        baseIncome: 150,
        basePrice: 2000,
        level: 0,
        owned: 0,
      },
      afb: { id: "afb", name: "AFB Industry", icon: "🏭", baseIncome: 200, basePrice: 4000, level: 0, owned: 0 },
      inferno: {
        id: "inferno",
        name: "Inferno Core",
        icon: "🔥",
        baseIncome: 250,
        basePrice: 6000,
        level: 0,
        owned: 0,
      },
      quantum_singularity: {
        id: "quantum_singularity",
        name: "Quantum Singularity",
        icon: "🌑",
        baseIncome: 500,
        basePrice: 15000,
        level: 0,
        owned: 0,
      },
    },
  })

  const [activeTab, setActiveTab] = useState("home")
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false)
  const [notification, setNotification] = useState("")
  const [isMiningActive, setIsMiningActive] = useState(false)
  const [miningCountdown, setMiningCountdown] = useState(0)

  // Load game state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gameState")
    if (saved) {
      try {
        setGameState(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading game state:", e)
      }
    }
  }, [])

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem("gameState", JSON.stringify(gameState))
  }, [gameState])

  // Mining interval
  useEffect(() => {
    const totalIncome = calculateTotalIncome()
    if (totalIncome > 0) {
      setIsMiningActive(true)
      const interval = setInterval(() => {
        setMiningCountdown((prev) => {
          if (prev <= 1) {
            setGameState((prev) => ({
              ...prev,
              gt: prev.gt + totalIncome,
            }))
            return 60
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setIsMiningActive(false)
      setMiningCountdown(0)
    }
  }, [gameState.miners])

  const calculateTotalIncome = () => {
    return Object.values(gameState.miners).reduce((total, miner) => {
      return total + miner.baseIncome * miner.owned
    }, 0)
  }

  const handleTap = () => {
    if (gameState.energy >= 1) {
      setGameState((prev) => ({
        ...prev,
        carrots: prev.carrots + prev.clicksPerTap,
        clicks: prev.clicks + 1,
        energy: prev.energy - 1,
      }))
    }
  }

  const buyMiner = (minerId: string, cost: number, currency: "gt" | "stars") => {
    const resource = currency === "gt" ? gameState.gt : gameState.stars

    if (resource < cost) {
      setNotification(`Не хватает ${currency === "gt" ? "GT" : "Stars"}!`)
      return
    }

    setGameState((prev) => ({
      ...prev,
      [currency === "gt" ? "gt" : "stars"]: resource - cost,
      miners: {
        ...prev.miners,
        [minerId]: {
          ...prev.miners[minerId],
          owned: prev.miners[minerId].owned + 1,
        },
      },
    }))

    setNotification(`Куплен ${gameState.miners[minerId].name}!`)
  }

  const buyStars = (amount: number) => {
    const cost = (amount / 2) * 1 // 1 GT = 2 Stars

    if (gameState.gt < cost) {
      setNotification("Не хватает GT!")
      return
    }

    setGameState((prev) => ({
      ...prev,
      gt: prev.gt - cost,
      stars: prev.stars + amount,
    }))

    setNotification(`Куплено ${amount} ⭐!`)
  }

  const totalIncome = calculateTotalIncome()

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 p-4 pb-32">
      <img
        src="/cute-guinea-pig-with-glasses-in-business-suit.jpg"
        alt="Guinea Pig"
        className="w-48 h-48 rounded-full mb-4 shadow-lg"
      />

      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Guinea Pig Clicker</h1>
        <p className="text-gray-300">Кликай морковки и зарабатывай!</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
        <div className="bg-orange-500 rounded-lg p-4 text-center">
          <p className="text-2xl">🥕</p>
          <p className="text-white font-bold">{gameState.carrots.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500 rounded-lg p-4 text-center">
          <p className="text-2xl">💎</p>
          <p className="text-white font-bold">{gameState.gt.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-500 rounded-lg p-4 text-center">
          <p className="text-2xl">⭐</p>
          <p className="text-white font-bold">{gameState.stars.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-8 w-full max-w-sm">
        <p className="text-white text-center mb-2">
          ⚡ Энергия: {gameState.energy}/{gameState.maxEnergy}
        </p>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-yellow-400 h-4 rounded-full transition-all"
            style={{ width: `${(gameState.energy / gameState.maxEnergy) * 100}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleTap}
        className="bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold text-2xl py-8 px-12 rounded-full shadow-lg transform hover:scale-105 transition-transform mb-4"
      >
        🐹 КЛИК
      </button>

      {totalIncome > 0 && (
        <div className="bg-green-600 text-white rounded-lg p-3 text-center w-full max-w-sm">
          <p className="text-sm">💰 Доход: +{totalIncome} GT в минуту</p>
          <p className="text-xs text-green-200">⏳ {miningCountdown}s</p>
        </div>
      )}
    </div>
  )

  const renderMiners = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 p-4 pb-32">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">⚒️ Майнеры</h2>

      {totalIncome > 0 && (
        <div className="bg-green-600 text-white rounded-lg p-3 mb-6 text-center">
          <p className="text-sm">💰 Доход: +{totalIncome} GT в минуту</p>
          <p className="text-xs text-green-200">⏳ {miningCountdown}s</p>
        </div>
      )}

      <div className="space-y-3">
        {Object.values(gameState.miners).map((miner) => (
          <div key={miner.id} className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <p className="text-3xl">{miner.icon}</p>
                <div>
                  <p className="text-white font-bold">{miner.name}</p>
                  <p className="text-gray-300 text-sm">Доход: {miner.baseIncome * miner.owned} GT/мин</p>
                </div>
              </div>
              <p className="text-white font-bold text-xl">{miner.owned}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => buyMiner(miner.id, miner.basePrice, "gt")}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-bold"
              >
                💎 {miner.basePrice} GT
              </button>
              <button
                onClick={() => buyMiner(miner.id, miner.basePrice * 2, "stars")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm font-bold"
              >
                ⭐ {miner.basePrice * 2}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderShop = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 p-4 pb-32">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">🛍️ Магазин</h2>

      <div className="space-y-3">
        <div className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-lg p-4">
          <p className="text-white font-bold mb-2">💎 Пакет GT</p>
          <p className="text-gray-300 text-sm mb-3">10 GT = 20 ⭐</p>
          <button
            onClick={() => buyStars(20)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-bold"
          >
            Купить
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-lg p-4">
          <p className="text-white font-bold mb-2">💎 Большой пакет GT</p>
          <p className="text-gray-300 text-sm mb-3">50 GT = 100 ⭐</p>
          <button
            onClick={() => buyStars(100)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-bold"
          >
            Купить
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-lg p-4">
          <p className="text-white font-bold mb-2">🔥 Мега пакет GT</p>
          <p className="text-gray-300 text-sm mb-3">100 GT = 200 ⭐</p>
          <button
            onClick={() => buyStars(200)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-bold"
          >
            Купить
          </button>
        </div>
      </div>
    </div>
  )

  const renderLeaderboard = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 p-4 pb-32">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">🏆 Топ 100</h2>

      <div className="space-y-2">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-4">
          <p className="text-white font-bold">🥇 Ты</p>
          <p className="text-gray-200">Морковок: {gameState.carrots.toLocaleString()}</p>
          <p className="text-gray-200">GT: {gameState.gt.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )

  const renderAbout = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 p-4 pb-32">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">👥 О нас</h2>

      <div className="space-y-4">
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold text-center"
        >
          📺 YouTube
        </a>
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-lg font-bold text-center"
        >
          🎵 TikTok
        </a>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center py-2 rounded ${activeTab === "home" ? "bg-purple-600" : "hover:bg-gray-700"}`}
          >
            <HomeIcon size={20} />
            <span className="text-xs">Главная</span>
          </button>
          <button
            onClick={() => setActiveTab("miners")}
            className={`flex flex-col items-center justify-center py-2 rounded ${activeTab === "miners" ? "bg-purple-600" : "hover:bg-gray-700"}`}
          >
            <Pickaxe size={20} />
            <span className="text-xs">Майнинг</span>
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex flex-col items-center justify-center py-2 rounded ${activeTab === "shop" ? "bg-purple-600" : "hover:bg-gray-700"}`}
          >
            <ShoppingCart size={20} />
            <span className="text-xs">Магазин</span>
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex flex-col items-center justify-center py-2 rounded ${activeTab === "leaderboard" ? "bg-purple-600" : "hover:bg-gray-700"}`}
          >
            <Trophy size={20} />
            <span className="text-xs">Топ</span>
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex flex-col items-center justify-center py-2 rounded ${activeTab === "about" ? "bg-purple-600" : "hover:bg-gray-700"}`}
          >
            <MessageCircle size={20} />
            <span className="text-xs">О нас</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="fixed top-4 left-4 right-4 bg-green-600 text-white p-3 rounded-lg z-40">{notification}</div>
      )}

      {activeTab === "home" && renderHome()}
      {activeTab === "miners" && renderMiners()}
      {activeTab === "shop" && renderShop()}
      {activeTab === "leaderboard" && renderLeaderboard()}
      {activeTab === "about" && renderAbout()}
    </div>
  )
}

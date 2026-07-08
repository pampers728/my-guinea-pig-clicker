"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Zap, Pickaxe, Users, Coins, Crown, HomeIcon, Globe, ShoppingBag, ArrowUpCircle, Gift } from "lucide-react"
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

interface PlayerMiner { miner_type: number; level: number }

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
  const [playerMiners, setPlayerMiners] = useState<PlayerMiner[]>([])
  const [activeTab, setActiveTab] = useState("main")
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"daily" | "weekly" | "alltime">("daily")
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [referralLink, setReferralLink] = useState("")
  const [referralBonus, setReferralBonus] = useState(0)
  const [referralsCount, setReferralsCount] = useState(0)
  const [carrotsPerClickLevel, setCarrotsPerClickLevel] = useState(1)
  const [maxEnergyLevel, setMaxEnergyLevel] = useState(1)
  const [showPigsModal, setShowPigsModal] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [wheelSpinsLeft, setWheelSpinsLeft] = useState(3)
  const [carrotRewardClaimed, setCarrotRewardClaimed] = useState(false)
  const [energyRewardClaimed, setEnergyRewardClaimed] = useState(false)
  const [autoTapActive, setAutoTapActive] = useState(false)
  const [autoTapEndTime, setAutoTapEndTime] = useState(0)
  const [boosterActive, setBoosterActive] = useState(false)
  const [boosterEndTime, setBoosterEndTime] = useState(0)

  const maxEnergy = getCurrentMaxEnergy(maxEnergyLevel)
  const carrotsPerClick = getCurrentCarrotsPerClick(carrotsPerClickLevel)
  const xpNeeded = calculateXPNeeded(level)
  const totalIncomePerHour = playerMiners.reduce((sum, pm) => sum + getMinerProfit(pm.miner_type, pm.level), 0) * (1 + referralBonus / 100)
  const userId = tg.user?.id ? String(tg.user.id) : "guest"

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
    const lastReset = localStorage.getItem(`gpc_daily_${userId}`)
    const today = new Date().toDateString()
    if (lastReset !== today) {
      setWheelSpinsLeft(3); setCarrotRewardClaimed(false); setEnergyRewardClaimed(false)
      localStorage.setItem(`gpc_daily_${userId}`, today)
    } else {
      setWheelSpinsLeft(Number(localStorage.getItem(`gpc_spins_${userId}`) || 3))
      setCarrotRewardClaimed(localStorage.getItem(`gpc_carrotReward_${userId}`) === "1")
      setEnergyRewardClaimed(localStorage.getItem(`gpc_energyReward_${userId}`) === "1")
    }
  }, [userId])

  // Auto-tap
  useEffect(() => {
    if (!autoTapActive) return
    const interval = setInterval(() => {
      if (Date.now() >= autoTapEndTime) { setAutoTapActive(false); clearInterval(interval); return }
      setCarrots(p => p + carrotsPerClick); setXP(p => p + 1); setTotalClicks(p => p + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [autoTapActive, autoTapEndTime, carrotsPerClick])

  // Booster timer
  useEffect(() => {
    if (!boosterActive) return
    const interval = setInterval(() => { if (Date.now() >= boosterEndTime) setBoosterActive(false) }, 5000)
    return () => clearInterval(interval)
  }, [boosterActive, boosterEndTime])

  // Persist to localStorage
  useEffect(() => {
    if (isLoading) return
    const data = { carrots, guineaTokens, telegramStars, level, xp, totalClicks, activePigId, unlockedPigs, playerMiners, carrotsPerClickLevel, maxEnergyLevel, referralBonus, referralsCount }
    localStorage.setItem(`gpc_${userId}`, JSON.stringify(data))
  }, [carrots, guineaTokens, telegramStars, level, xp, totalClicks, activePigId, unlockedPigs, playerMiners, carrotsPerClickLevel, maxEnergyLevel, referralBonus, referralsCount, isLoading])

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
        setCarrots(d.carrots || 0); setGuineaTokens(d.guineaTokens || 0)
        setTelegramStars(d.telegramStars || 0); setLevel(d.level || 1); setXP(d.xp || 0)
        setTotalClicks(d.totalClicks || 0); setActivePigId(d.activePigId || "white_basic")
        setUnlockedPigs(d.unlockedPigs || ["white_basic"])
        setCarrotsPerClickLevel(d.carrotsPerClickLevel || 1)
        setMaxEnergyLevel(d.maxEnergyLevel || 1)
        setPlayerMiners(d.playerMiners || [])
        setEnergy(getCurrentMaxEnergy(d.maxEnergyLevel || 1))
        setReferralBonus(d.referralBonus || 0); setReferralsCount(d.referralsCount || 0)
      } catch (e) {}
    }
    setIsLoading(false)
  }

  const handleReferral = async (referrerId: number) => {
    if (!tg.user || tg.user.id === referrerId) return
    try { await fetch("/api/referral/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, referrerId }) }) } catch {}
  }

  const handleClick = () => {
    if (energy < 1) return
    const mult = boosterActive ? 2 : 1
    setCarrots(p => p + carrotsPerClick * mult)
    setEnergy(p => p - 1); setTotalClicks(p => p + 1)
    let newXP = xp + 1, newLevel = level
    while (newXP >= calculateXPNeeded(newLevel)) {
      newXP -= calculateXPNeeded(newLevel); newLevel++
      const r = getLevelRewards(newLevel)
      if (r.pig) setUnlockedPigs(prev => prev.includes(r.pig!) ? prev : [...prev, r.pig!])
    }
    setXP(newXP); setLevel(newLevel)
  }

  const handleWheelSpin = () => {
    const n = wheelSpinsLeft - 1; setWheelSpinsLeft(n)
    localStorage.setItem(`gpc_spins_${userId}`, String(n))
  }

  const handleWheelPrize = (prize: any, value: number) => {
    if (prize.type === "carrots") setCarrots(p => p + value)
    else if (prize.type === "energy") setEnergy(p => Math.min(p + value, maxEnergy))
    else if (prize.type === "gt") setGuineaTokens(p => p + value)
    else if (prize.type === "autotap") { setAutoTapActive(true); setAutoTapEndTime(Date.now() + value * 60000) }
    else if (prize.type === "booster") { setBoosterActive(true); setBoosterEndTime(Date.now() + value * 60000) }
  }

  const claimCarrots = () => {
    setCarrots(p => p + 2000); setCarrotRewardClaimed(true)
    localStorage.setItem(`gpc_carrotReward_${userId}`, "1")
  }
  const claimEnergy = () => {
    setEnergy(p => Math.min(p + 1000, maxEnergy)); setEnergyRewardClaimed(true)
    localStorage.setItem(`gpc_energyReward_${userId}`, "1")
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
    setCarrots(p => p - gt * CARROT_TO_GT_RATE); setGuineaTokens(p => p + gt)
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
      const res = await fetch(`/api/leaderboard/${period}`)
      const data = await res.json()
      setLeaderboard(data.data || [])
    } catch {}
  }

  const handleLeaderboardPeriod = (p: "daily" | "weekly" | "alltime") => {
    setLeaderboardPeriod(p); loadLeaderboard(p)
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
    { id: "miners", icon: <Pickaxe className="w-5 h-5" />, label: "Майнеры" },
    { id: "upgrades", icon: <ArrowUpCircle className="w-5 h-5" />, label: "Апгрейды" },
    { id: "friends", icon: <Users className="w-5 h-5" />, label: "Друзья" },
    { id: "shop", icon: <ShoppingBag className="w-5 h-5" />, label: "Магазин" },
    { id: "leaderboard", icon: <Crown className="w-5 h-5" />, label: "Топ", onClick: () => loadLeaderboard(leaderboardPeriod) },
  ]

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
              <span className="font-bold text-gray-300">Lvl {level}</span>
              <span className="text-gray-400"> {xp}/{xpNeeded} XP</span>
            </div>
          </div>
          <div className="flex gap-1">
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
                +{carrotsPerClick * (boosterActive ? 2 : 1)} 🥕 за тап
                {boosterActive && <span className="text-pink-400 ml-1">(x2 буст!)</span>}
              </p>
              {autoTapActive && <p className="text-xs text-green-400 animate-pulse">🤖 Авто-тап активен</p>}
            </div>
          </div>
        )}

        {activeTab === "bonuses" && (
          <BonusesTab
            wheelSpinsLeft={wheelSpinsLeft} carrotRewardClaimed={carrotRewardClaimed}
            energyRewardClaimed={energyRewardClaimed} autoTapActive={autoTapActive}
            boosterActive={boosterActive} autoTapEndTime={autoTapEndTime} boosterEndTime={boosterEndTime}
            onWheelSpin={handleWheelSpin} onWheelPrize={handleWheelPrize}
            onClaimCarrots={claimCarrots} onClaimEnergy={claimEnergy}
          />
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

        {activeTab === "friends" && (
          <FriendsTab referralLink={referralLink} referralsCount={referralsCount} referralBonus={referralBonus}
            onCopy={() => navigator.clipboard.writeText(referralLink)}
            onShare={() => tg.isAvailable && window.open(`https://t.me/share/url?url=${referralLink}&text=Join%20Guinea%20Pig%20Clicker!`, "_blank")} />
        )}

        {activeTab === "shop" && <ShopTab isPurchasing={isPurchasing} onBuyGT={buyGTWithStars} />}

        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard} leaderboardPeriod={leaderboardPeriod} onPeriodChange={handleLeaderboardPeriod} />
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-purple-500/30">
        <div className="grid grid-cols-7 bg-gray-900/50 p-2 rounded-t-2xl max-w-2xl mx-auto">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); tab.onClick?.() }}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors text-[10px] ${activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

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
                <div key={pig.id} onClick={() => isUnlocked && (setActivePigId(pig.id), setShowPigsModal(false))}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${isActive ? "border-purple-400 bg-purple-900/50" : isUnlocked ? "border-gray-600 bg-black/30 hover:border-gray-400" : "border-gray-700 bg-black/20 opacity-50 cursor-not-allowed"}`}>
                  <img src={pig.icon} alt={pig.name[language]} className="w-12 h-12 mx-auto mb-1 object-contain" />
                  <p className="text-xs font-medium">{pig.name[language]}</p>
                  {!isUnlocked && <p className="text-[10px] text-gray-500 mt-1">Locked</p>}
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
            <DialogDescription className="text-gray-400">Choose your preferred language</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {(["en","ru","uk","kk","pt","be","es","de","pl","fr","zh","ja","ko","tr"] as Language[]).map((lang) => (
              <Button key={lang} onClick={() => { setLanguage(lang); setShowLanguageModal(false) }}
                variant={language === lang ? "default" : "outline"} className="text-sm">{lang.toUpperCase()}</Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

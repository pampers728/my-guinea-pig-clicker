"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const AD_URL = "https://www.profitablecpmratenetwork.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005"

export type ChestType = "free" | "premium" | "rare" | "boss"

interface ChestReward {
  icon: string
  label: string
  type: "carrots" | "gt" | "booster" | "autotap"
  amount: number
}

function rollChest(type: ChestType): ChestReward {
  const roll = Math.random()
  if (type === "free") {
    if (roll < 0.6) return { icon: "🥕", label: `${Math.floor(500 + Math.random() * 2000).toLocaleString()} морковок`, type: "carrots", amount: Math.floor(500 + Math.random() * 2000) }
    if (roll < 0.85) return { icon: "⚡", label: "Буст x2 на 10 мин", type: "booster", amount: 10 }
    return { icon: "🤖", label: "Авто-тап 5 мин", type: "autotap", amount: 5 }
  }
  if (type === "premium") {
    if (roll < 0.5) return { icon: "🥕", label: `${Math.floor(2000 + Math.random() * 8000).toLocaleString()} морковок`, type: "carrots", amount: Math.floor(2000 + Math.random() * 8000) }
    if (roll < 0.75) return { icon: "🪙", label: `${(Math.random() * 2 + 0.5).toFixed(1)} GT`, type: "gt", amount: parseFloat((Math.random() * 2 + 0.5).toFixed(1)) }
    if (roll < 0.9) return { icon: "⚡", label: "Буст x2 на 30 мин", type: "booster", amount: 30 }
    return { icon: "🤖", label: "Авто-тап 15 мин", type: "autotap", amount: 15 }
  }
  if (type === "rare" || type === "boss") {
    if (roll < 0.3) return { icon: "🥕", label: `${Math.floor(10000 + Math.random() * 40000).toLocaleString()} морковок`, type: "carrots", amount: Math.floor(10000 + Math.random() * 40000) }
    if (roll < 0.65) return { icon: "🪙", label: `${(Math.random() * 5 + 2).toFixed(1)} GT`, type: "gt", amount: parseFloat((Math.random() * 5 + 2).toFixed(1)) }
    if (roll < 0.85) return { icon: "⚡", label: "Буст x3 на 30 мин", type: "booster", amount: 30 }
    return { icon: "🤖", label: "Авто-тап 30 мин", type: "autotap", amount: 30 }
  }
  return { icon: "🥕", label: "500 морковок", type: "carrots", amount: 500 }
}

const CHEST_CONFIG = {
  free: { label: "Бесплатный сундук", color: "from-gray-600 to-gray-800", icon: "📦", borderColor: "border-gray-500/30" },
  premium: { label: "Премиум сундук", color: "from-purple-700 to-blue-800", icon: "💜", borderColor: "border-purple-500/30" },
  rare: { label: "Редкий сундук", color: "from-yellow-600 to-orange-700", icon: "🏆", borderColor: "border-yellow-500/30" },
  boss: { label: "Сундук босса", color: "from-red-700 to-purple-900", icon: "👑", borderColor: "border-red-500/30" },
}

interface ChestOpenerProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  chestType: ChestType
  guineaTokens?: number
  onReward: (reward: ChestReward) => void
}

export default function ChestOpener({ open, onOpenChange, chestType, guineaTokens = 0, onReward }: ChestOpenerProps) {
  const [state, setState] = useState<"ready" | "opening" | "revealed">("ready")
  const [reward, setReward] = useState<ChestReward | null>(null)
  const cfg = CHEST_CONFIG[chestType]

  const openChest = () => {
    setState("opening")
    setTimeout(() => {
      const r = rollChest(chestType)
      setReward(r)
      setState("revealed")
      onReward(r)
    }, 1000)
  }

  const handleClose = () => {
    setState("ready")
    setReward(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onOpenChange={handleClose} className="bg-black/95 border-yellow-500/30 text-white max-w-xs">
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold text-center bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>
            {cfg.label}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 sr-only">
            Открыть сундук и получить награду
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {state === "ready" && (
            <>
              <div
                className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-6xl shadow-2xl cursor-pointer hover:scale-105 transition-transform active:scale-95`}
                onClick={openChest}
              >
                {cfg.icon}
              </div>
              <p className="text-gray-400 text-sm text-center">Нажмите на сундук чтобы открыть</p>
              <Button onClick={openChest} className={`bg-gradient-to-r ${cfg.color} text-white font-bold px-8`}>
                Открыть
              </Button>
            </>
          )}

          {state === "opening" && (
            <div className="text-8xl animate-bounce">{cfg.icon}</div>
          )}

          {state === "revealed" && reward && (
            <>
              <div className="text-7xl animate-pulse">{reward.icon}</div>
              <p className="text-2xl font-bold text-yellow-400 text-center">{reward.label}</p>
              <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700 text-white font-bold w-full">
                Забрать
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Chest cards for display in the Bonuses/Shop tab
interface ChestCardProps {
  type: ChestType
  available: boolean
  nextFreeIn?: number // minutes
  gtCost?: number
  onOpen: () => void
  onWatchAd?: () => void
}

export function ChestCard({ type, available, nextFreeIn, gtCost, onOpen, onWatchAd }: ChestCardProps) {
  const cfg = CHEST_CONFIG[type]
  return (
    <div
      onClick={available ? onOpen : onWatchAd}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${cfg.borderColor} bg-black/40 w-20`}
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center text-xl`}>
        {cfg.icon}
      </div>
      <p className="text-[9px] text-gray-300 text-center leading-tight">{cfg.label.replace(" сундук", "")}</p>
      {available ? (
        <span className="text-[9px] text-green-400 font-bold">Открыть</span>
      ) : nextFreeIn !== undefined && nextFreeIn > 0 ? (
        <span className="text-[9px] text-gray-500">{nextFreeIn}м</span>
      ) : gtCost ? (
        <span className="text-[9px] text-yellow-400">{gtCost} GT</span>
      ) : null}
    </div>
  )
}

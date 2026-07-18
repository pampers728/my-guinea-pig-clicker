"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CatchCarrot from "@/components/games/CatchCarrot"
import GambleCarrot from "@/components/games/GambleCarrot"
import BossBattle from "@/components/games/BossBattle"
import Plinko from "@/components/games/Plinko"

interface GamesTabProps {
  carrots: number
  bossAvailable: boolean
  bossNextTime: number
  freeGambleUsed: boolean
  onCarrotGameReward: (multiplier: number, durationMin: number) => void
  onGamble: (bet: number, result: number, won: boolean) => void
  onUseFreeGamble: () => void
  onBossVictory: (reward: "chest" | "boost", boostMin?: number) => void
  onBossDefeat: () => void
  onPlinkoResult: (win: number, bet: number) => void
}

const GAMES = [
  {
    id: "catch",
    title: "Поймай морковку",
    description: "20 сек — лови морковки! 50+ = x2, 80+ = x3 буст",
    icon: "🥕",
    color: "from-orange-600 to-yellow-600",
    badge: "Бесплатно",
  },
  {
    id: "gamble",
    title: "Рискни морковкой",
    description: "Ставь морковки: x2 / x3 / x5 или проигрыш",
    icon: "🎲",
    color: "from-red-600 to-pink-600",
    badge: "Азарт",
  },
  {
    id: "boss",
    title: "Босс каждые 3 часа",
    description: "Мега-Хомяк появился! 30 сек — тапай по боссу",
    icon: "👹",
    color: "from-purple-700 to-red-700",
    badge: "Каждые 3ч",
  },
  {
    id: "plinko",
    title: "Plinko",
    description: "Брось шар — x0.5 до x10! Очень затягивает",
    icon: "⚽",
    color: "from-blue-600 to-cyan-600",
    badge: "Удача",
  },
]

export default function GamesTab({
  carrots, bossAvailable, bossNextTime, freeGambleUsed,
  onCarrotGameReward, onGamble, onUseFreeGamble,
  onBossVictory, onBossDefeat, onPlinkoResult,
}: GamesTabProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  const bossTimeLeft = Math.max(0, bossNextTime - Date.now())
  const bossMinutes = Math.ceil(bossTimeLeft / 60000)

  if (activeGame === "catch") {
    return (
      <CatchCarrot
        onClose={() => setActiveGame(null)}
        onReward={onCarrotGameReward}
      />
    )
  }

  if (activeGame === "gamble") {
    return (
      <GambleCarrot
        carrots={carrots}
        freeGambleUsed={freeGambleUsed}
        onGamble={onGamble}
        onUseFreeGamble={onUseFreeGamble}
        onClose={() => setActiveGame(null)}
      />
    )
  }

  if (activeGame === "boss") {
    return (
      <BossBattle
        onClose={() => setActiveGame(null)}
        onVictory={onBossVictory}
        onDefeat={onBossDefeat}
      />
    )
  }

  if (activeGame === "plinko") {
    return (
      <Plinko
        carrots={carrots}
        onClose={() => setActiveGame(null)}
        onResult={onPlinkoResult}
      />
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-white text-center">Мини-игры</h2>

      {GAMES.map((game) => {
        const isBoss = game.id === "boss"
        const locked = isBoss && !bossAvailable

        return (
          <Card
            key={game.id}
            className={`border p-4 ${locked ? "bg-gray-900/40 border-gray-700/30" : "bg-black/30 border-purple-500/30"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shrink-0`}>
                {game.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm">{game.title}</h3>
                  <span className="text-[10px] bg-purple-800/50 border border-purple-500/30 rounded-full px-2 py-0.5 text-purple-300">
                    {game.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{game.description}</p>
                {isBoss && !bossAvailable && (
                  <p className="text-xs text-red-400 mt-1">Следующий через {bossMinutes} мин</p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => !locked && setActiveGame(game.id)}
                disabled={locked}
                className={`shrink-0 ${locked ? "bg-gray-700" : `bg-gradient-to-r ${game.color} hover:opacity-90`} text-white font-bold`}
              >
                {locked ? "Скоро" : "Играть"}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

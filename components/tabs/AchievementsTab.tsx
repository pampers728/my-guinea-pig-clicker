"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  target: number
  progress: number
  unlocked: boolean
  reward: string
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_click", title: "Первый тап", description: "Нажать 1 раз", icon: "👆", target: 1, progress: 0, unlocked: false, reward: "100 морковок" },
  { id: "clicks_1000", title: "Тапер", description: "Нажать 1 000 раз", icon: "👊", target: 1000, progress: 0, unlocked: false, reward: "5 000 морковок" },
  { id: "clicks_10000", title: "Профи", description: "Нажать 10 000 раз", icon: "🏅", target: 10000, progress: 0, unlocked: false, reward: "1 GT" },
  { id: "carrots_1m", title: "Миллионер", description: "Заработать 1 000 000 морковок", icon: "💰", target: 1000000, progress: 0, unlocked: false, reward: "5 GT" },
  { id: "carrots_100k", title: "Фермер", description: "Заработать 100 000 морковок", icon: "🌾", target: 100000, progress: 0, unlocked: false, reward: "0.5 GT" },
  { id: "miner_1", title: "Первый майнер", description: "Купить любого майнера", icon: "⛏️", target: 1, progress: 0, unlocked: false, reward: "2 000 морковок" },
  { id: "all_miners", title: "Все майнеры", description: "Купить все типы майнеров", icon: "🏭", target: 12, progress: 0, unlocked: false, reward: "10 GT" },
  { id: "level_10", title: "Ветеран", description: "Достичь 10 уровня", icon: "⭐", target: 10, progress: 0, unlocked: false, reward: "2 GT" },
  { id: "level_25", title: "Мастер", description: "Достичь 25 уровня", icon: "🌟", target: 25, progress: 0, unlocked: false, reward: "5 GT" },
  { id: "boss_1", title: "Истребитель", description: "Победить первого босса", icon: "⚔️", target: 1, progress: 0, unlocked: false, reward: "Редкий сундук" },
  { id: "referrals_5", title: "Вербовщик", description: "Привести 5 друзей", icon: "👥", target: 5, progress: 0, unlocked: false, reward: "3 GT" },
  { id: "streak_7", title: "Преданный", description: "7 дней подряд в игре", icon: "📆", target: 7, progress: 0, unlocked: false, reward: "Редкий сундук" },
]

interface AchievementsTabProps {
  achievements: Achievement[]
}

export default function AchievementsTab({ achievements }: AchievementsTabProps) {
  const unlocked = achievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Достижения</h2>
        <span className="text-xs text-gray-400 bg-black/30 rounded-full px-3 py-1">
          {unlocked}/{achievements.length}
        </span>
      </div>

      <div className="space-y-2">
        {achievements.map((ach) => {
          const pct = Math.min(100, (ach.progress / ach.target) * 100)
          return (
            <Card
              key={ach.id}
              className={`border p-3 ${ach.unlocked ? "bg-yellow-900/20 border-yellow-500/30" : "bg-black/30 border-gray-700/20"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-3xl shrink-0 ${!ach.unlocked ? "grayscale opacity-40" : ""}`}>
                  {ach.unlocked ? ach.icon : "🔒"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`font-semibold text-sm ${ach.unlocked ? "text-yellow-400" : "text-white"}`}>
                      {ach.title}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{ach.reward}</span>
                  </div>
                  <p className="text-xs text-gray-400">{ach.description}</p>
                  {!ach.unlocked && (
                    <div className="mt-1.5 space-y-0.5">
                      <Progress value={pct} className="h-1" />
                      <p className="text-[10px] text-gray-500">
                        {ach.progress.toLocaleString()} / {ach.target.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {ach.unlocked && (
                    <p className="text-[10px] text-green-400 mt-0.5">Получено!</p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

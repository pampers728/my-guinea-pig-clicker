"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  level: number
}

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[]
  leaderboardPeriod: "daily" | "weekly" | "alltime"
  onPeriodChange: (period: "daily" | "weekly" | "alltime") => void
}

const PERIOD_LABELS = { daily: "Сегодня", weekly: "Неделя", alltime: "Всё время" }

export default function LeaderboardTab({ leaderboard, leaderboardPeriod, onPeriodChange }: LeaderboardTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
        <Crown className="w-5 h-5 text-yellow-400" />
        Топ игроков
      </h2>
      <div className="flex gap-2 justify-center">
        {(["daily", "weekly", "alltime"] as const).map((p) => (
          <Button
            key={p}
            size="sm"
            onClick={() => onPeriodChange(p)}
            variant={leaderboardPeriod === p ? "default" : "outline"}
            className="text-xs"
          >
            {PERIOD_LABELS[p]}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Пока нет данных</p>
        ) : leaderboard.map((player, i) => (
          <Card key={i} className={`border p-3 ${i < 3 ? "bg-yellow-900/20 border-yellow-500/30" : "bg-purple-900/30 border-purple-500/30"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`text-lg font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-500"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{player.username}</div>
                  <div className="text-xs text-gray-400">Уровень {player.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-400 text-sm">{player.score?.toLocaleString()}</div>
                <div className="text-xs text-gray-400">морковок</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

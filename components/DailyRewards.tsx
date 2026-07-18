"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Day rewards: carrots for days 1-6, special on day 7
const DAILY_REWARDS = [
  { day: 1, type: "carrots", amount: 500, label: "500 морковок", icon: "🥕" },
  { day: 2, type: "carrots", amount: 1000, label: "1 000 морковок", icon: "🥕" },
  { day: 3, type: "gt", amount: 1, label: "1 GT", icon: "🪙" },
  { day: 4, type: "carrots", amount: 3000, label: "3 000 морковок", icon: "🥕" },
  { day: 5, type: "carrots", amount: 5000, label: "5 000 морковок", icon: "🥕" },
  { day: 6, type: "gt", amount: 3, label: "3 GT", icon: "🪙" },
  { day: 7, type: "chest", amount: 1, label: "Редкий сундук", icon: "📦" },
]

interface DailyRewardsProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  streakDay: number // 1-7
  lastClaimDate: string // ISO date string or ""
  onClaim: (reward: { type: string; amount: number }) => void
}

export default function DailyRewards({
  open, onOpenChange, streakDay, lastClaimDate, onClaim,
}: DailyRewardsProps) {
  const today = new Date().toDateString()
  const alreadyClaimed = lastClaimDate === today
  const currentReward = DAILY_REWARDS[(streakDay - 1) % 7]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenChange={onOpenChange}
        className="bg-black/95 border-yellow-500/30 text-white max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-yellow-400">
            Ежедневная награда
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Заходи каждый день — серия дает больше наград!
          </DialogDescription>
        </DialogHeader>

        {/* Streak grid */}
        <div className="grid grid-cols-7 gap-1 my-2">
          {DAILY_REWARDS.map((r) => {
            const done = r.day < streakDay || (r.day === streakDay && alreadyClaimed)
            const isToday = r.day === streakDay && !alreadyClaimed
            return (
              <div
                key={r.day}
                className={`flex flex-col items-center gap-1 rounded-lg p-1.5 border text-center transition-all
                  ${done ? "bg-green-900/40 border-green-500/40 opacity-70" :
                    isToday ? "bg-yellow-900/40 border-yellow-400 ring-1 ring-yellow-400" :
                    "bg-gray-900/40 border-gray-700/30"}`}
              >
                <span className="text-lg">{done ? "✅" : r.icon}</span>
                <span className="text-[9px] text-gray-400">Д{r.day}</span>
              </div>
            )
          })}
        </div>

        {/* Current reward */}
        <Card className="bg-yellow-900/20 border-yellow-500/30 p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">День {streakDay} — ваша награда</p>
          <div className="text-5xl mb-2">{currentReward.icon}</div>
          <p className="text-xl font-bold text-yellow-400">{currentReward.label}</p>
        </Card>

        <Button
          onClick={() => !alreadyClaimed && onClaim(currentReward)}
          disabled={alreadyClaimed}
          className={`w-full font-bold text-lg h-12 ${alreadyClaimed ? "bg-gray-700" : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"}`}
        >
          {alreadyClaimed ? "Уже получено сегодня" : "Забрать"}
        </Button>

        {!alreadyClaimed && streakDay > 1 && (
          <p className="text-center text-xs text-green-400">
            Серия: {streakDay - 1} {streakDay - 1 === 1 ? "день" : "дней"} — не прерывай!
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

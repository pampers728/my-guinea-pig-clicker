"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export interface Quest {
  id: string
  title: string
  description: string
  icon: string
  target: number
  progress: number
  reward: { type: "carrots" | "gt" | "ticket"; amount: number }
  claimed: boolean
}

const REWARD_LABELS: Record<string, string> = { carrots: "морковок", gt: "GT", ticket: "билет" }

interface QuestsTabProps {
  quests: Quest[]
  onClaim: (questId: string) => void
}

export default function QuestsTab({ quests, onClaim }: QuestsTabProps) {
  const completedCount = quests.filter(q => q.progress >= q.target).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Задания</h2>
        <span className="text-xs text-gray-400 bg-black/30 rounded-full px-3 py-1">
          {completedCount}/{quests.length} выполнено
        </span>
      </div>

      <p className="text-xs text-gray-500 text-center">Задания обновляются каждый день</p>

      {quests.map((quest) => {
        const done = quest.progress >= quest.target
        const pct = Math.min(100, (quest.progress / quest.target) * 100)
        return (
          <Card
            key={quest.id}
            className={`border p-3 ${done && !quest.claimed ? "bg-green-900/20 border-green-500/30" : quest.claimed ? "bg-gray-900/30 border-gray-700/20 opacity-60" : "bg-black/30 border-purple-500/20"}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl shrink-0">{quest.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-white">{quest.title}</p>
                  <span className="text-xs text-yellow-400 shrink-0">
                    +{quest.reward.amount} {REWARD_LABELS[quest.reward.type]}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{quest.description}</p>
                <div className="mt-2 space-y-1">
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      {quest.progress.toLocaleString()} / {quest.target.toLocaleString()}
                    </span>
                    {done && !quest.claimed && (
                      <Button
                        size="sm"
                        onClick={() => onClaim(quest.id)}
                        className="h-6 px-3 text-[10px] bg-green-600 hover:bg-green-700"
                      >
                        Забрать
                      </Button>
                    )}
                    {quest.claimed && (
                      <span className="text-[10px] text-green-400">Получено</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

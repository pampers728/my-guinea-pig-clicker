"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MINERS, getMinerCost, getMinerProfit } from "@/lib/pigs"
import type { Language } from "@/lib/i18n"

interface PlayerMiner {
  miner_type: number
  level: number
}

interface MinersTabProps {
  playerMiners: PlayerMiner[]
  guineaTokens: number
  totalIncomePerHour: number
  language: Language
  onBuy: (minerType: number) => void
}

export default function MinersTab({ playerMiners, guineaTokens, totalIncomePerHour, language, onBuy }: MinersTabProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-white text-center">Майнеры</h2>
      {totalIncomePerHour > 0 && (
        <Card className="bg-green-900/30 border-green-500/30 p-3 text-center">
          <p className="text-xs text-gray-400">Общий пассивный доход</p>
          <p className="text-lg font-bold text-green-400">+{totalIncomePerHour.toFixed(4)} GT / час</p>
          <p className="text-xs text-green-300">+{(totalIncomePerHour * 24).toFixed(3)} GT / день</p>
        </Card>
      )}
      <div className="grid grid-cols-1 gap-3">
        {MINERS.map((minerDef) => {
          const owned = playerMiners.find((m) => m.miner_type === minerDef.id)
          const currentLevel = owned?.level || 0
          const isMaxLevel = currentLevel >= 5
          const nextCost = isMaxLevel ? 0 : getMinerCost(minerDef.id, currentLevel + 1)
          const currentProfit = currentLevel > 0 ? getMinerProfit(minerDef.id, currentLevel) : 0
          const nextProfit = !isMaxLevel ? getMinerProfit(minerDef.id, currentLevel || 1) : 0
          const canAfford = guineaTokens >= nextCost

          return (
            <Card
              key={minerDef.id}
              className={`border p-3 ${currentLevel > 0 ? "bg-purple-900/40 border-purple-500/40" : "bg-black/30 border-gray-700/40"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="text-2xl shrink-0">{minerDef.icon}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-white truncate">
                      {minerDef.name[language] || minerDef.name.en}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] px-1">
                        Уровень {currentLevel}/5
                      </Badge>
                      {currentLevel > 0 ? (
                        <span className="text-[10px] text-green-400">+{currentProfit.toFixed(3)} GT/час</span>
                      ) : (
                        <span className="text-[10px] text-gray-500">Доход: {nextProfit.toFixed(3)} GT/час</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {isMaxLevel ? (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-xs">MAX</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onBuy(minerDef.id)}
                      disabled={!canAfford}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-40 text-xs h-10 px-3"
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="font-semibold">{currentLevel === 0 ? "Купить" : "Улучшить"}</span>
                        <span className="font-bold text-white">{nextCost} GT</span>
                      </div>
                    </Button>
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

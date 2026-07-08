"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentMaxEnergy, getCurrentCarrotsPerClick, getCarrotsPerClickUpgradeCost, getMaxEnergyUpgradeCost, CARROT_TO_GT_RATE } from "@/lib/pigs"

interface UpgradesTabProps {
  carrots: number
  guineaTokens: number
  carrotsPerClickLevel: number
  maxEnergyLevel: number
  onUpgradeClick: () => void
  onUpgradeEnergy: () => void
  onExchange: () => void
}

export default function UpgradesTab({
  carrots, guineaTokens, carrotsPerClickLevel, maxEnergyLevel,
  onUpgradeClick, onUpgradeEnergy, onExchange,
}: UpgradesTabProps) {
  const carrotsPerClick = getCurrentCarrotsPerClick(carrotsPerClickLevel)
  const maxEnergy = getCurrentMaxEnergy(maxEnergyLevel)
  const clickCostInfo = getCarrotsPerClickUpgradeCost(carrotsPerClickLevel)
  const energyCostInfo = getMaxEnergyUpgradeCost(maxEnergyLevel)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white text-center">Апгрейды</h2>

      <Card className="bg-purple-900/30 border-purple-500/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">Морковки за клик</h3>
            <p className="text-xs text-gray-400">Уровень {carrotsPerClickLevel}/10</p>
            <p className="text-xs text-orange-400">Сейчас: {carrotsPerClick} за клик</p>
            {carrotsPerClickLevel < 10 && (
              <p className="text-xs text-green-400">Следующий: {carrotsPerClickLevel + 1} за клик</p>
            )}
          </div>
          {clickCostInfo ? (
            <Button
              onClick={onUpgradeClick}
              disabled={clickCostInfo.type === "carrots" ? carrots < clickCostInfo.amount : guineaTokens < clickCostInfo.amount}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 shrink-0"
              size="sm"
            >
              <div className="flex flex-col items-center leading-tight text-xs">
                <span>Улучшить</span>
                <span className="font-bold">
                  {clickCostInfo.amount.toLocaleString()} {clickCostInfo.type === "carrots" ? "🥕" : "GT"}
                </span>
              </div>
            </Button>
          ) : (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">MAX</Badge>
          )}
        </div>
      </Card>

      <Card className="bg-blue-900/30 border-blue-500/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">Максимальная энергия</h3>
            <p className="text-xs text-gray-400">Уровень {maxEnergyLevel}/10</p>
            <p className="text-xs text-blue-400">Сейчас: {maxEnergy} энергии</p>
            {maxEnergyLevel < 10 && (
              <p className="text-xs text-green-400">Следующий: {getCurrentMaxEnergy(maxEnergyLevel + 1)} энергии</p>
            )}
          </div>
          {energyCostInfo ? (
            <Button
              onClick={onUpgradeEnergy}
              disabled={energyCostInfo.type === "carrots" ? carrots < energyCostInfo.amount : guineaTokens < energyCostInfo.amount}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 shrink-0"
              size="sm"
            >
              <div className="flex flex-col items-center leading-tight text-xs">
                <span>Улучшить</span>
                <span className="font-bold">
                  {energyCostInfo.amount.toLocaleString()} {energyCostInfo.type === "carrots" ? "🥕" : "GT"}
                </span>
              </div>
            </Button>
          ) : (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">MAX</Badge>
          )}
        </div>
      </Card>

      <Card className="bg-orange-900/30 border-orange-500/30 p-4">
        <h3 className="font-semibold text-white text-center mb-2">Обмен морковок</h3>
        <p className="text-sm text-gray-300 text-center mb-3">250,000 🥕 = 1 GT</p>
        <p className="text-xs text-gray-400 text-center mb-3">
          У вас: {carrots.toLocaleString()} 🥕 → {Math.floor(carrots / CARROT_TO_GT_RATE)} GT
        </p>
        <Button
          onClick={onExchange}
          disabled={carrots < CARROT_TO_GT_RATE}
          className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:opacity-40"
        >
          Обменять ({Math.floor(carrots / CARROT_TO_GT_RATE)} GT)
        </Button>
      </Card>
    </div>
  )
}

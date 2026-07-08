"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import FortuneWheel from "@/components/FortuneWheel"

const AD_URL = "https://www.profitablecpmratenetwork.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005"

interface BonusesTabProps {
  wheelSpinsLeft: number
  carrotRewardClaimed: boolean
  energyRewardClaimed: boolean
  autoTapActive: boolean
  boosterActive: boolean
  autoTapEndTime: number
  boosterEndTime: number
  onWheelSpin: () => void
  onWheelPrize: (prize: any, value: number) => void
  onClaimCarrots: () => void
  onClaimEnergy: () => void
}

export default function BonusesTab({
  wheelSpinsLeft, carrotRewardClaimed, energyRewardClaimed,
  autoTapActive, boosterActive, autoTapEndTime, boosterEndTime,
  onWheelSpin, onWheelPrize, onClaimCarrots, onClaimEnergy,
}: BonusesTabProps) {
  const handleAdThenClaim = (callback: () => void, claimed: boolean) => {
    if (claimed) return
    // Open ad first, then claim after short delay
    window.open(AD_URL, "_blank")
    setTimeout(callback, 3000)
  }

  return (
    <div className="space-y-4">
      {(autoTapActive || boosterActive) && (
        <Card className="bg-purple-900/40 border-purple-500/30 p-3">
          <h3 className="text-sm font-bold text-purple-300 mb-2">Активные бусты</h3>
          <div className="space-y-1">
            {autoTapActive && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <span>🤖</span>
                <span>Авто-тап активен ({Math.max(0, Math.ceil((autoTapEndTime - Date.now()) / 60000))} мин)</span>
              </div>
            )}
            {boosterActive && (
              <div className="flex items-center gap-2 text-xs text-pink-400">
                <span>🚀</span>
                <span>x2 морковки ({Math.max(0, Math.ceil((boosterEndTime - Date.now()) / 60000))} мин)</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Fortune Wheel */}
      <FortuneWheel
        spinsLeft={wheelSpinsLeft}
        onSpin={onWheelSpin}
        onPrize={onWheelPrize}
        canSpin={wheelSpinsLeft > 0}
      />

      {/* Ad rewards */}
      <div className="space-y-3 mt-2">
        <h3 className="text-lg font-bold text-white text-center">Награды за рекламу</h3>

        <Card className={`p-4 border ${carrotRewardClaimed ? "bg-gray-800/40 border-gray-600/30" : "bg-orange-900/30 border-orange-500/30"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🥕</div>
              <div>
                <p className="font-bold text-white">+2 000 морковок</p>
                <p className="text-xs text-gray-400">1 раз в день за рекламу</p>
              </div>
            </div>
            <Button
              onClick={() => handleAdThenClaim(onClaimCarrots, carrotRewardClaimed)}
              disabled={carrotRewardClaimed}
              className={`h-10 px-4 ${carrotRewardClaimed ? "bg-gray-600" : "bg-orange-600 hover:bg-orange-700"}`}
            >
              {carrotRewardClaimed ? "Получено" : "Смотреть"}
            </Button>
          </div>
        </Card>

        <Card className={`p-4 border ${energyRewardClaimed ? "bg-gray-800/40 border-gray-600/30" : "bg-green-900/30 border-green-500/30"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <div>
                <p className="font-bold text-white">+1 000 энергии</p>
                <p className="text-xs text-gray-400">1 раз в день за рекламу</p>
              </div>
            </div>
            <Button
              onClick={() => handleAdThenClaim(onClaimEnergy, energyRewardClaimed)}
              disabled={energyRewardClaimed}
              className={`h-10 px-4 ${energyRewardClaimed ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"}`}
            >
              {energyRewardClaimed ? "Получено" : "Смотреть"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

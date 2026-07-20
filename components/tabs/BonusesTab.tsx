"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import FortuneWheel from "@/components/FortuneWheel"
import AdModal, { type AdRewardType } from "@/components/AdModal"

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
  onWheelAdGranted: () => void
}

export default function BonusesTab({
  wheelSpinsLeft, carrotRewardClaimed, energyRewardClaimed,
  autoTapActive, boosterActive, autoTapEndTime, boosterEndTime,
  onWheelSpin, onWheelPrize, onClaimCarrots, onClaimEnergy, onWheelAdGranted,
}: BonusesTabProps) {
  const [adOpen, setAdOpen] = useState(false)
  const [pendingReward, setPendingReward] = useState<AdRewardType>("carrots")
  const [pendingLabel, setPendingLabel] = useState("")
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null)

  const openAd = (type: AdRewardType, label: string, callback: () => void) => {
    setPendingReward(type)
    setPendingLabel(label)
    setPendingCallback(() => callback)
    setAdOpen(true)
  }

  const handleRewardGranted = () => {
    pendingCallback?.()
  }

  return (
    <div className="space-y-4">
      {(autoTapActive || boosterActive) && (
        <Card className="bg-purple-900/40 border-purple-500/30 p-3">
          <h3 className="text-sm font-bold text-purple-300 mb-2">Активные бусты</h3>
          <div className="space-y-1">
            {autoTapActive && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <span>Авто-тап активен ({Math.max(0, Math.ceil((autoTapEndTime - Date.now()) / 60000))} мин)</span>
              </div>
            )}
            {boosterActive && (
              <div className="flex items-center gap-2 text-xs text-pink-400">
                <span>x2 морковки ({Math.max(0, Math.ceil((boosterEndTime - Date.now()) / 60000))} мин)</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Fortune Wheel */}
      <div className="space-y-2">
        <FortuneWheel
          spinsLeft={wheelSpinsLeft}
          onSpin={onWheelSpin}
          onPrize={onWheelPrize}
          canSpin={wheelSpinsLeft > 0}
        />
        {/* Extra spin via ad */}
        <button
          onClick={() => openAd("wheel_spin", "+1 попытка прокрутки колеса", onWheelAdGranted)}
          className="w-full text-xs text-purple-300 underline underline-offset-2 text-center py-1"
        >
          Получить ещё попытку за рекламу
        </button>
      </div>

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
              onClick={() => !carrotRewardClaimed && openAd("carrots", "+2 000 морковок", onClaimCarrots)}
              disabled={carrotRewardClaimed}
              className={`h-10 px-4 ${carrotRewardClaimed ? "bg-gray-600 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}`}
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
              onClick={() => !energyRewardClaimed && openAd("energy", "+1 000 энергии", onClaimEnergy)}
              disabled={energyRewardClaimed}
              className={`h-10 px-4 ${energyRewardClaimed ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            >
              {energyRewardClaimed ? "Получено" : "Смотреть"}
            </Button>
          </div>
        </Card>
      </div>

      <AdModal
        open={adOpen}
        rewardType={pendingReward}
        rewardLabel={pendingLabel}
        onClose={() => setAdOpen(false)}
        onRewardGranted={handleRewardGranted}
      />
    </div>
  )
}

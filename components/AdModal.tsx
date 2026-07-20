"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"

// Adsterra Smartlink
const AD_URL = "https://www.effectivegatecpm.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005"

export type AdRewardType = "carrots" | "energy" | "wheel_spin"

interface AdModalProps {
  open: boolean
  rewardType: AdRewardType
  rewardLabel: string
  onClose: () => void
  onRewardGranted: () => void
}

const WAIT_SECONDS = 15

export default function AdModal({ open, rewardType, rewardLabel, onClose, onRewardGranted }: AdModalProps) {
  const [step, setStep] = useState<"idle" | "watching" | "confirm" | "done">("idle")
  const [countdown, setCountdown] = useState(WAIT_SECONDS)

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("idle")
      setCountdown(WAIT_SECONDS)
    }
  }, [open])

  // Countdown after ad opened
  useEffect(() => {
    if (step !== "watching") return
    if (countdown <= 0) {
      setStep("confirm")
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [step, countdown])

  const handleWatchAd = useCallback(() => {
    // Open the Adsterra smartlink in a new tab
    window.open(AD_URL, "_blank", "noopener")
    setStep("watching")
    setCountdown(WAIT_SECONDS)
  }, [])

  const handleConfirm = useCallback(() => {
    setStep("done")
    onRewardGranted()
  }, [onRewardGranted])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70">
      <div className="w-full max-w-md bg-gray-900 border border-purple-500/40 rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300">
        {step === "idle" && (
          <>
            <div className="text-center space-y-2">
              <div className="text-4xl">🎬</div>
              <h3 className="text-lg font-bold text-white">Посмотреть рекламу</h3>
              <p className="text-sm text-gray-400">
                Откроется страница рекламы в новой вкладке.<br />
                После просмотра вернитесь и нажмите&nbsp;<b className="text-green-400">«Получить»</b>.
              </p>
              <div className="mt-1 text-sm font-semibold text-yellow-300">Награда: {rewardLabel}</div>
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1 border-gray-600 text-gray-300">
                Отмена
              </Button>
              <Button onClick={handleWatchAd} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold">
                Смотреть рекламу
              </Button>
            </div>
          </>
        )}

        {step === "watching" && (
          <div className="text-center space-y-3 py-2">
            <div className="text-4xl animate-pulse">🎬</div>
            <h3 className="text-lg font-bold text-white">Идёт просмотр...</h3>
            <p className="text-sm text-gray-400">Реклама открылась в новой вкладке.<br />Не закрывайте её.</p>
            <div className="text-3xl font-bold text-purple-400">{countdown}</div>
            <p className="text-xs text-gray-500">секунд осталось</p>
          </div>
        )}

        {step === "confirm" && (
          <>
            <div className="text-center space-y-2">
              <div className="text-4xl">✅</div>
              <h3 className="text-lg font-bold text-white">Реклама просмотрена?</h3>
              <p className="text-sm text-gray-400">Нажмите «Получить» чтобы забрать награду.</p>
              <div className="text-sm font-semibold text-yellow-300">{rewardLabel}</div>
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1 border-gray-600 text-gray-300">
                Отмена
              </Button>
              <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                Получить
              </Button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center space-y-3 py-2">
            <div className="text-4xl">🎉</div>
            <h3 className="text-lg font-bold text-green-400">Награда получена!</h3>
            <Button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Закрыть
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

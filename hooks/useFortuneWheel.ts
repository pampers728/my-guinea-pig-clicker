"use client"

import { useState, useCallback } from "react"
import { WheelPrize } from "@/types/rewards"

interface UseFortuneWheelProps {
  userId: string
  onPrize: (prize: WheelPrize, value: number) => void
}

export function useFortuneWheel({ userId, onPrize }: UseFortuneWheelProps) {
  const [loading, setLoading] = useState(false)
  const [canSpin, setCanSpin] = useState(true)
  const [spinsLeft, setSpinsLeft] = useState(3)

  const validateAdWatch = useCallback(async (): Promise<boolean> => {
    // Simulate ad validation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  }, [])

  const claimPrize = useCallback(async (prizeId?: number): Promise<WheelPrize> => {
    setLoading(true)
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const prize: WheelPrize = {
          id: prizeId || 1,
          label: "+500 🥕",
          color: "#f97316",
          type: "carrots",
          amount: 500,
          prob: 25
        }
        
        setSpinsLeft(prev => Math.max(0, prev - 1))
        setCanSpin(spinsLeft > 1)
        setLoading(false)
        
        onPrize(prize, prize.amount || 0)
        resolve(prize)
      }, 1000)
    })
  }, [spinsLeft, onPrize])

  const checkDailyLimits = useCallback(() => {
    // Check daily limits logic
    setCanSpin(spinsLeft > 0)
  }, [spinsLeft])

  return {
    loading,
    canSpin,
    spinsLeft,
    validateAdWatch,
    claimPrize,
    checkDailyLimits
  }
}

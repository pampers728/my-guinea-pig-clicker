"use client"

import { useEffect, useState } from "react"
import { antiCheat } from "@/lib/anticheat"

export function useAntiCheat() {
  const [isBlocked, setIsBlocked] = useState(false)
  const [warnings, setWarnings] = useState(0)

  useEffect(() => {
    const checkStatus = () => {
      const stats = antiCheat.getSessionStats()
      setIsBlocked(stats.isBlocked)
      setWarnings(stats.warnings)
    }

    const interval = setInterval(checkStatus, 1000)
    
    return () => {
      clearInterval(interval)
      antiCheat.destroy()
    }
  }, [])

  const validateClick = (x?: number, y?: number) => {
    return antiCheat.validateClick(x, y)
  }

  const validateProgress = (carrots: number, sessionTime: number) => {
    return antiCheat.validateProgress(carrots, sessionTime)
  }

  return {
    isBlocked,
    warnings,
    validateClick,
    validateProgress,
    getStats: () => antiCheat.getSessionStats()
  }
}

import { useState, useEffect } from 'react'
import { Prize, UserReward } from '@/types/rewards'

export function useRewards(userId: string) {
  const [loading, setLoading] = useState(false)
  const [dailyUsage, setDailyUsage] = useState({
    fortune_wheel: 0,
    free_carrots: 0,
    free_energy: 0
  })

  const checkDailyLimits = async () => {
    try {
      const response = await fetch(`/api/rewards/limits?userId=${userId}`)
      const data = await response.json()
      setDailyUsage(data.usage)
    } catch (error) {
      console.error('Error checking daily limits:', error)
    }
  }

  const claimReward = async (adToken: string, prizeId?: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          adToken,
          prizeId,
          type: 'fortune_wheel'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        await checkDailyLimits() // Обновляем лимиты
        return result.prize
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      checkDailyLimits()
    }
  }, [userId])

  return {
    loading,
    dailyUsage,
    claimReward,
    checkDailyLimits
  }
}

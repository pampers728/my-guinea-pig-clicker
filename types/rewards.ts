export interface WheelPrize {
  id: number
  label: string
  color: string
  type: 'carrots' | 'energy' | 'autotap' | 'booster' | 'gt'
  min?: number
  max?: number
  duration?: number
  prob: number
  amount?: number
}

export interface RewardClaim {
  userId: string
  adToken: string
  prizeId: number
  amount: number
}

export interface DailyUsage {
  fortune_wheel: number
  free_carrots: number
  free_energy: number
}

export interface AdTokenValidation {
  token: string
  isValid: boolean
  timestamp: number
}

export interface Prize {
  id: string
  type: 'auto_tap' | 'carrots' | 'energy' | 'booster' | 'gt'
  name: string
  duration?: number // в минутах для бустеров
  amount?: number // количество для мгновенных призов
  multiplier?: number // множитель для бустеров
  probability: number // вероятность в процентах
  icon: string
}

export interface UserReward {
  id: string
  user_id: string
  prize_id: string
  claimed_at: string
  expires_at?: string
  is_active: boolean
}

export interface DailyLimits {
  fortune_wheel: number // 3 раза за рекламу
  free_carrots: number // 2000 морковь 1 раз
  free_energy: number // 1000 энергии 1 раз
}

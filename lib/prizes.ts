import { Prize, DailyLimits } from '@/types/rewards'

export const FORTUNE_WHEEL_PRIZES: Prize[] = [
  {
    id: 'auto_tap_30',
    type: 'auto_tap',
    name: 'Авто-тэп 30 мин',
    duration: 30,
    probability: 5,
    icon: '🤖'
  },
  {
    id: 'auto_tap_60',
    type: 'auto_tap', 
    name: 'Авто-тэп 60 мин',
    duration: 60,
    probability: 2,
    icon: '🤖'
  },
  {
    id: 'carrots',
    type: 'carrots',
    name: 'Морковки',
    amount: Math.floor(Math.random() * (2500 - 50) + 50),
    probability: 50,
    icon: '🥕'
  },
  {
    id: 'energy',
    type: 'energy',
    name: 'Энергия',
    amount: Math.floor(Math.random() * (1000 - 100) + 100),
    probability: 25,
    icon: '⚡'
  },
  {
    id: 'booster',
    type: 'booster',
    name: 'Бустер морковок',
    duration: Math.floor(Math.random() * (60 - 30) + 30),
    multiplier: 2,
    probability: 10,
    icon: '🚀'
  },
  {
    id: 'gt',
    type: 'gt',
    name: 'GT',
    amount: Math.random() * (0.1 - 0.01) + 0.01,
    probability: 2,
    icon: '💎'
  }
]

export const DAILY_LIMITS: DailyLimits = {
  fortune_wheel: 3,
  free_carrots: 1,
  free_energy: 1
}

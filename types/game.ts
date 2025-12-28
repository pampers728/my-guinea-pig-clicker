export type PigRarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY" | "LIMITED"

export interface Pig {
  id: string
  name: string
  rarity: PigRarity
  obtainedAt?: Date
  source?: string
  icon: string
  description: string
}

export interface PlayerData {
  userId: number
  username?: string
  score: number
  xp: number
  level: number
  carrots: number
  guineaTokens: number
  telegramStars: number
  totalClicks: number
  activePigId: string
  pigs: Pig[]
  referrerId?: number
  referralBonus: number // percentage bonus (0-15)
  referralsCount: number
  miners: any[]
  taskProgress: any
  createdAt: Date
  updatedAt: Date
}

export interface PendingInvoice {
  userId: number
  invoicePayload: string
  gtAmount: number
  createdAt: Date
}

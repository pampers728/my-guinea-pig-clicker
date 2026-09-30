export type PigRarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY" | "LIMITED" | "EVENT"

export interface PigData {
  id: string
  name: { [lang: string]: string }
  rarity: PigRarity
  icon: string // URL to image
  description: { [lang: string]: string }
  unlockLevel?: number
  source: "starter" | "level" | "event" | "referral" | "case"
}

export const PIGS: PigData[] = [
  {
    id: "white_basic",
    name: { en: "White Pig", ru: "Белая свинка", uk: "Біла свинка" },
    rarity: "COMMON",
    icon: "/images/img-20251228-164730-075.png",
    description: { en: "Basic white guinea pig", ru: "Базовая белая морская свинка", uk: "Базова біла морська свинка" },
    unlockLevel: 5,
    source: "starter",
  },
  {
    id: "tattoo_v1",
    name: { en: "Tattoo Pig v1", ru: "Свинка с тату v1", uk: "Свинка з тату v1" },
    rarity: "LIMITED",
    icon: "/images/img-20251228-165157-1-1.png",
    description: {
      en: "Limited edition tattoo pig",
      ru: "Лимитированная свинка с татуировкой",
      uk: "Лімітована свинка з татуюванням",
    },
    unlockLevel: 10,
    source: "level",
  },
  {
    id: "santa",
    name: { en: "Santa Pig", ru: "Дед Мороз", uk: "Дід Мороз" },
    rarity: "EVENT",
    icon: "/images/img-20251228-165611-087.png",
    description: { en: "New Year event pig", ru: "Новогодняя свинка", uk: "Новорічна свинка" },
    unlockLevel: 15,
    source: "event",
  },
  {
    id: "tattoo_v2",
    name: { en: "Tattoo Pig v2", ru: "Свинка с тату v2", uk: "Свинка з тату v2" },
    rarity: "LIMITED",
    icon: "/images/1766770908657.png",
    description: {
      en: "Limited edition Day of the Dead tattoo pig",
      ru: "Лимитированная свинка с татуировкой День мертвых",
      uk: "Лімітована свинка з татуюванням День мертвих",
    },
    unlockLevel: 25,
    source: "level",
  },
  {
    id: "brown_basic",
    name: { en: "Panda Pig", ru: "Свинка-панда", uk: "Свинка-панда" },
    rarity: "COMMON",
    icon: "/images/img-20251228-164908.png",
    description: {
      en: "Cute panda guinea pig",
      ru: "Милая морская свинка-панда",
      uk: "Мила морська свинка-панда",
    },
    unlockLevel: 20,
    source: "level",
  },
]

export function getPigsByRarity(rarity: PigRarity): PigData[] {
  return PIGS.filter((p) => p.rarity === rarity)
}

export function getPigById(id: string): PigData | undefined {
  return PIGS.find((p) => p.id === id)
}

export function calculateXPNeeded(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function getLevelRewards(level: number): { pig?: string; bonus?: string } {
  const rewards: { [key: number]: { pig?: string; bonus?: string } } = {
    5: { pig: "white_basic" },
    10: { pig: "tattoo_v1" },
    15: { pig: "santa" },
    20: { pig: "brown_basic" },
    25: { pig: "tattoo_v2" },
  }
  return rewards[level] || {}
}

// Upgrade system based on user table
// Levels 1-5: carrots, Levels 6-10: GT
const ENERGY_LEVELS = [1000, 1500, 2000, 3500, 5000, 6500, 7500, 8500, 9500, 10000]
const CARROTS_PER_CLICK_COST = [5000, 15000, 40000, 100000, 220000]  // levels 1→2, 2→3, 3→4, 4→5, 5→6
const ENERGY_COST =            [5000, 15000, 40000, 100000, 220000]  // same structure
const GT_UPGRADE_COST =        [8, 18, 32, 55, 90]                   // levels 6→7, 7→8, 8→9, 9→10

export function getCurrentMaxEnergy(level: number): number {
  if (level < 1 || level > 10) return 1000
  return ENERGY_LEVELS[level - 1]
}

export function getCurrentCarrotsPerClick(level: number): number {
  if (level < 1 || level > 10) return 1
  return level // 1 морковка за тап на 1 уровне, 10 на 10 уровне
}

export function getCarrotsPerClickUpgradeCost(currentLevel: number): { type: 'carrots' | 'gt', amount: number } | null {
  if (currentLevel >= 10) return null
  if (currentLevel < 5) {
    return { type: 'carrots', amount: CARROTS_PER_CLICK_COST[currentLevel] }
  }
  return { type: 'gt', amount: GT_UPGRADE_COST[currentLevel - 5] }
}

export function getMaxEnergyUpgradeCost(currentLevel: number): { type: 'carrots' | 'gt', amount: number } | null {
  if (currentLevel >= 10) return null
  if (currentLevel < 5) {
    return { type: 'carrots', amount: ENERGY_COST[currentLevel] }
  }
  return { type: 'gt', amount: GT_UPGRADE_COST[currentLevel - 5] }
}

// Miners System
export interface MinerType {
  id: number
  name: { [lang: string]: string }
  icon: string
  baseProfit: number // GT per hour at level 1
  baseCost: number // GT cost for level 1
  costMultiplier: number // Multiplier for each level
  profitMultiplier: number // Multiplier for each level
}

export const MINERS: MinerType[] = [
  {
    id: 1,
    name: { en: "Carrot Farmer", ru: "Морковный фермер", uk: "Морквяний фермер" },
    icon: "/images/icon-carrot.png",
    baseProfit: 0.1,
    baseCost: 5,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 2,
    name: { en: "Hay Harvester", ru: "Сборщик сена", uk: "Збирач сіна" },
    icon: "🌾",
    baseProfit: 0.3,
    baseCost: 15,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 3,
    name: { en: "Pellet Producer", ru: "Производитель гранул", uk: "Виробник гранул" },
    icon: "🌰",
    baseProfit: 0.8,
    baseCost: 40,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 4,
    name: { en: "Veggie Vendor", ru: "Продавец овощей", uk: "Продавець овочів" },
    icon: "🥬",
    baseProfit: 2,
    baseCost: 100,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 5,
    name: { en: "Guinea Garden", ru: "Свинский сад", uk: "Свинячий сад" },
    icon: "🏡",
    baseProfit: 5,
    baseCost: 250,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 6,
    name: { en: "Snack Supplier", ru: "Поставщик лакомств", uk: "Постачальник ласощів" },
    icon: "🍪",
    baseProfit: 12,
    baseCost: 600,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 7,
    name: { en: "Feed Factory", ru: "Фабрика корма", uk: "Фабрика корму" },
    icon: "🏭",
    baseProfit: 30,
    baseCost: 1500,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 8,
    name: { en: "Treat Treasury", ru: "Хранилище угощений", uk: "Сховище частувань" },
    icon: "💎",
    baseProfit: 75,
    baseCost: 3500,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 9,
    name: { en: "Nutrition Hub", ru: "Центр питания", uk: "Центр харчування" },
    icon: "🏢",
    baseProfit: 180,
    baseCost: 8000,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 10,
    name: { en: "Gourmet Kitchen", ru: "Кухня гурманов", uk: "Кухня гурманів" },
    icon: "👨‍🍳",
    baseProfit: 450,
    baseCost: 18000,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 11,
    name: { en: "Delicacy Den", ru: "Логово деликатесов", uk: "Лігво делікатесів" },
    icon: "🎪",
    baseProfit: 1100,
    baseCost: 40000,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
  {
    id: 12,
    name: { en: "Royal Pantry", ru: "Королевская кладовая", uk: "Королівська комора" },
    icon: "👑",
    baseProfit: 2700,
    baseCost: 90000,
    costMultiplier: 2,
    profitMultiplier: 1.5,
  },
]

export function getMinerCost(minerType: number, level: number): number {
  const miner = MINERS.find((m) => m.id === minerType)
  if (!miner) return 0
  return Math.floor(miner.baseCost * Math.pow(miner.costMultiplier, level - 1))
}

export function getMinerProfit(minerType: number, level: number): number {
  const miner = MINERS.find((m) => m.id === minerType)
  if (!miner) return 0
  return miner.baseProfit * Math.pow(miner.profitMultiplier, level - 1)
}

export function calculateOfflineIncome(
  miners: { miner_type: number; level: number }[],
  lastSeenDate: Date,
): number {
  const now = new Date()
  const hoursOffline = Math.min((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60), 24) // Max 24 hours
  
  let totalProfitPerHour = 0
  for (const miner of miners) {
    totalProfitPerHour += getMinerProfit(miner.miner_type, miner.level)
  }
  
  // Offline = 50% efficiency
  const offlineProfit = totalProfitPerHour * 0.5 * hoursOffline
  
  // Anti-cheat: max 30 GT/hour
  const maxIncome = 30 * hoursOffline
  return Math.min(offlineProfit, maxIncome)
}

// Exchange rate: 250,000 carrots = 1 GT
export const CARROT_TO_GT_RATE = 250000

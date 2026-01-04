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

export function getCurrentMaxEnergy(level: number): number {
  return 1000 + level * 50
}

export function getCurrentCarrotsPerClick(level: number): number {
  return 1 + Math.floor(level / 5)
}

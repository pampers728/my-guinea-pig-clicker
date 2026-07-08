"use client"

import { Button } from "@/components/ui/button"

interface ShopTabProps {
  isPurchasing: boolean
  onBuyGT: (gtAmount: number) => void
}

const GT_PACKS = [
  { gt: 100, stars: 50 },
  { gt: 500, stars: 250 },
  { gt: 1000, stars: 500 },
  { gt: 3000, stars: 1400 },
  { gt: 5000, stars: 2300 },
  { gt: 7000, stars: 3200 },
]

export default function ShopTab({ isPurchasing, onBuyGT }: ShopTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white text-center">Магазин</h2>
      <p className="text-xs text-gray-400 text-center">Купить Guinea Tokens за Telegram Stars</p>
      <div className="grid grid-cols-2 gap-2">
        {GT_PACKS.map((pack) => (
          <Button
            key={pack.gt}
            onClick={() => onBuyGT(pack.gt)}
            disabled={isPurchasing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-auto py-3 flex flex-col gap-1 disabled:opacity-50"
          >
            <span className="font-bold text-base">{pack.gt} GT</span>
            <span className="text-xs opacity-80">{pack.stars} Stars</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

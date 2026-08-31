"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ShopTabProps {
  isPurchasing: boolean
  onBuyGT: (gtAmount: number) => void
  guineaTokens: number
  telegramStars: number
  onSpendGT?: (amount: number, title: string) => void
}

const GT_PACKS = [
  { gt: 100, stars: 50 }, { gt: 500, stars: 250 }, { gt: 1000, stars: 500 },
  { gt: 3000, stars: 1400 }, { gt: 5000, stars: 2300 }, { gt: 7000, stars: 3200 },
]

const ITEMS = [
  { icon: "🤖", title: "Авто-фермер", detail: "Автоклик на 1 час", price: 25 },
  { icon: "⚡", title: "Бустер x2", detail: "Доход x2 на 1 час", price: 15 },
  { icon: "🚀", title: "Бустер x5", detail: "Доход x5 на 15 минут", price: 30 },
  { icon: "🔋", title: "Полная энергия", detail: "Мгновенное восстановление", price: 10 },
  { icon: "📺", title: "Без рекламы", detail: "Покупка навсегда", price: 250 },
  { icon: "🎁", title: "Подарок другу", detail: "Роза или токен в профиль", price: 20 },
]

const COSMETICS = [
  { icon: "🌙", title: "Фон: Ночной город", detail: "Уникальное оформление поля", price: 80 },
  { icon: "✨", title: "Эффект: Искры", detail: "Красивый эффект каждого тапа", price: 60 },
  { icon: "🏆", title: "Рамка: Первая эра", detail: "Статус в рейтинге", price: 120 },
]

export default function ShopTab({ isPurchasing, onBuyGT, guineaTokens, telegramStars, onSpendGT }: ShopTabProps) {
  const buy = (item: (typeof ITEMS)[number] | (typeof COSMETICS)[number]) => {
    if (guineaTokens >= item.price) onSpendGT?.(item.price, item.title)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white text-center">Магазин</h2>
      <div className="flex justify-center gap-2 text-xs text-gray-400">
        <Badge variant="outline">{guineaTokens.toFixed(2)} GT</Badge>
        <Badge variant="outline">{telegramStars} Stars</Badge>
      </div>

      <Card className="bg-black/20 border-purple-500/30 p-3">
        <p className="text-sm font-semibold text-white">Игровая валюта</p>
        <p className="text-xs text-gray-400 mb-3">Покупай GT за Telegram Stars — MS нельзя купить напрямую.</p>
        <div className="grid grid-cols-2 gap-2">
          {GT_PACKS.map((pack) => (
            <Button key={pack.gt} onClick={() => onBuyGT(pack.gt)} disabled={isPurchasing} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-auto py-3 flex flex-col gap-1 disabled:opacity-50">
              <span className="font-bold text-base">{pack.gt} GT</span><span className="text-xs opacity-80">{pack.stars} Stars</span>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="bg-black/20 border-purple-500/30 p-3">
        <p className="text-sm font-semibold text-white mb-1">Ускорители и комфорт</p>
        <p className="text-xs text-gray-400 mb-3">Трать GT на время и удобство, не покупая Mining Score.</p>
        <div className="grid grid-cols-2 gap-2">
          {ITEMS.map((item) => (
            <Button key={item.title} variant="outline" onClick={() => buy(item)} disabled={guineaTokens < item.price} className="h-auto min-h-20 p-2 flex flex-col items-start gap-0.5 text-left">
              <span className="text-lg">{item.icon}</span><span className="text-xs font-semibold text-white">{item.title}</span><span className="text-[10px] text-gray-400">{item.detail}</span><span className="text-[10px] text-yellow-400">{item.price} GT</span>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="bg-black/20 border-purple-500/30 p-3">
        <div className="flex items-center justify-between mb-1"><p className="text-sm font-semibold text-white">Косметика и статус</p><Badge className="bg-yellow-600">Коллекция</Badge></div>
        <p className="text-xs text-gray-400 mb-3">Скины, рамки, эффекты и уникальные фоны.</p>
        <div className="grid grid-cols-3 gap-2">
          {COSMETICS.map((item) => (
            <Button key={item.title} variant="outline" onClick={() => buy(item)} disabled={guineaTokens < item.price} className="h-auto min-h-24 p-2 flex flex-col items-center gap-1 text-center"><span className="text-2xl">{item.icon}</span><span className="text-[10px] font-semibold text-white">{item.title.replace("Фон: ", "").replace("Эффект: ", "").replace("Рамка: ", "")}</span><span className="text-[10px] text-yellow-400">{item.price} GT</span></Button>
          ))}
        </div>
      </Card>

      <Card className="bg-black/20 border-purple-500/30 p-3 space-y-2">
        <p className="text-sm font-semibold text-white">Редкие предметы и наборы</p>
        <div className="flex items-center justify-between gap-2"><span className="text-xs text-gray-300">🏆 Лимитированный трофей №1–100</span><Badge variant="outline">Крипто</Badge></div>
        <div className="flex items-center justify-between gap-2"><span className="text-xs text-gray-300">🐾 Уникальный питомец</span><Badge variant="outline">Крипто</Badge></div>
        <div className="flex items-center justify-between gap-2"><span className="text-xs text-gray-300">🎒 Стартовый набор новичка</span><Badge className="bg-green-600">Stars</Badge></div>
        <div className="flex items-center justify-between gap-2"><span className="text-xs text-gray-300">👑 Набор элитного игрока</span><Badge className="bg-purple-600">Premium</Badge></div>
      </Card>
    </div>
  )
}


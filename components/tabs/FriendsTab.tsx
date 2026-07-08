"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Share2, UserPlus, Coins } from "lucide-react"

interface FriendsTabProps {
  referralLink: string
  referralsCount: number
  referralBonus: number
  onCopy: () => void
  onShare: () => void
}

export default function FriendsTab({ referralLink, referralsCount, referralBonus, onCopy, onShare }: FriendsTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white text-center">Друзья</h2>
      <Card className="bg-purple-900/30 border-purple-500/30 p-4">
        <p className="text-xs text-gray-300 mb-2">Ваша реферальная ссылка</p>
        <div className="flex gap-2">
          <input type="text" value={referralLink} readOnly className="flex-1 bg-black/30 text-white px-3 py-2 rounded text-xs" />
          <Button onClick={onCopy} size="sm" className="bg-green-600 hover:bg-green-700"><Copy className="w-4 h-4" /></Button>
          <Button onClick={onShare} size="sm" className="bg-blue-600 hover:bg-blue-700"><Share2 className="w-4 h-4" /></Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-900/30 border-green-500/30 p-4 text-center">
          <UserPlus className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{referralsCount}</div>
          <div className="text-xs text-gray-400">Рефералов</div>
        </Card>
        <Card className="bg-yellow-900/30 border-yellow-500/30 p-4 text-center">
          <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">+{referralBonus}%</div>
          <div className="text-xs text-gray-400">Бонус дохода</div>
        </Card>
      </div>
      <Card className="bg-black/20 border-gray-700/30 p-4">
        <h3 className="font-semibold text-sm text-white mb-3">Наши соцсети</h3>
        <div className="space-y-2">
          <a href="https://tiktok.com/@guinea.pig.clicker.en" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-300 hover:text-white">
            <span className="text-lg">🎵</span> TikTok EN @guinea.pig.clicker.en
          </a>
          <a href="https://tiktok.com/@guinea.pig.clicker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-300 hover:text-white">
            <span className="text-lg">🎵</span> TikTok СНГ @guinea.pig.clicker
          </a>
          <a href="https://www.youtube.com/@GuineaPigClicker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-300 hover:text-white">
            <span className="text-lg">▶️</span> YouTube @GuineaPigClicker
          </a>
        </div>
      </Card>
    </div>
  )
}

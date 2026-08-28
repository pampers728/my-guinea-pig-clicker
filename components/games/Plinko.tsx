"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const AD_URL = "https://www.profitablecpmratenetwork.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005"

const MULTIPLIERS = [10, 5, 3, 2, 1, 0.5, 1, 2, 3, 5, 10]
const COLORS = [
  "bg-yellow-500", "bg-orange-500", "bg-red-500", "bg-green-500",
  "bg-blue-500", "bg-gray-500", "bg-blue-500", "bg-green-500",
  "bg-red-500", "bg-orange-500", "bg-yellow-500",
]

interface PlinkoProps {
  carrots: number
  onClose: () => void
  onResult: (winAmount: number, betAmount: number) => void
}

export default function Plinko({ carrots, onClose, onResult }: PlinkoProps) {
  const [bet, setBet] = useState(100)
  const [dropping, setDropping] = useState(false)
  const [ballPos, setBallPos] = useState<number | null>(null)
  const [landedSlot, setLandedSlot] = useState<number | null>(null)
  const [lastResult, setLastResult] = useState<{ multiplier: number; win: number } | null>(null)
  const [freeDropUsed, setFreeDropUsed] = useState(false)

  const QUICK_BETS = [100, 500, 1000, 5000, 10000]
  const maxBet = Math.min(carrots, 250000)

  const drop = () => {
    if (dropping || (freeDropUsed && bet > carrots) || bet <= 0) return
    setDropping(true)
    setLandedSlot(null)
    setLastResult(null)

    // Simulate ball path
    let position = 5 // start center
    const steps = 8
    let step = 0

    const animate = setInterval(() => {
      step++
      position += Math.random() > 0.5 ? 1 : -1
      position = Math.max(0, Math.min(10, position))
      setBallPos(position)

      if (step >= steps) {
        clearInterval(animate)
        const finalSlot = Math.round(position)
        setLandedSlot(finalSlot)
        const mult = MULTIPLIERS[finalSlot]
        const win = Math.floor(bet * mult)
        setLastResult({ multiplier: mult, win })
        onResult(win, bet)
        setDropping(false)
        if (!freeDropUsed) setFreeDropUsed(true)
      }
    }, 250)
  }

  const watchAdAndDrop = () => {
    window.open(AD_URL, "_blank")
    setTimeout(() => {
      setFreeDropUsed(false)
    }, 3000)
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-purple-900/40 to-transparent">
        <h2 className="text-xl font-bold text-white">Plinko</h2>
        <div className="text-center">
          <p className="text-lg font-bold text-orange-400">{carrots.toLocaleString()} 🥕</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white">✕</Button>
      </div>

      {/* Board */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        {/* Multiplier slots */}
        <div className="flex gap-1 w-full max-w-xs">
          {MULTIPLIERS.map((m, i) => (
            <div
              key={i}
              className={`flex-1 rounded py-1.5 text-center text-xs font-bold transition-all duration-300 ${
                landedSlot === i ? "scale-110 ring-2 ring-white" : ""
              } ${COLORS[i]} text-white`}
            >
              x{m}
            </div>
          ))}
        </div>

        {/* Pegs visual */}
        <div className="relative w-full max-w-xs h-48 bg-black/30 rounded-xl border border-purple-500/20 overflow-hidden flex items-center justify-center">
          {/* Ball */}
          {dropping && ballPos !== null && (
            <div
              className="absolute top-4 w-6 h-6 rounded-full bg-orange-400 shadow-lg shadow-orange-500/50 transition-all duration-200 game-pulse-ring"
              style={{ left: `${(ballPos / 10) * 85 + 7}%` }}
            />
          )}
          {/* Pegs */}
          {[...Array(5)].map((_, row) => (
            <div key={row} className="absolute flex gap-6" style={{ top: `${20 + row * 18}%` }}>
              {[...Array(row + 3)].map((_, col) => (
                <div key={col} className="w-2 h-2 rounded-full bg-gray-400 opacity-60" />
              ))}
            </div>
          ))}
          {!dropping && !lastResult && (
            <p className="text-gray-500 text-sm">Нажмите "Бросить"</p>
          )}
          {lastResult && (
            <div className="text-center">
              <p className={`text-3xl font-bold ${lastResult.multiplier >= 2 ? "text-yellow-400" : lastResult.multiplier < 1 ? "text-red-400" : "text-white"}`}>
                x{lastResult.multiplier}
              </p>
              <p className={`text-lg font-bold ${lastResult.win >= bet ? "text-green-400" : "text-red-400"}`}>
                {lastResult.win >= bet ? "+" : ""}{(lastResult.win - bet).toLocaleString()} 🥕
              </p>
            </div>
          )}
        </div>

        {/* Bet controls */}
        <Card className="w-full max-w-xs bg-black/40 border-purple-500/20 p-4 space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_BETS.map(a => (
              <button
                key={a}
                onClick={() => setBet(Math.min(a, maxBet))}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  bet === a ? "bg-purple-600 border-purple-400 text-white" : "border-gray-600 text-gray-400 hover:border-gray-400"
                }`}
              >
                {a >= 1000 ? `${a / 1000}K` : a}
              </button>
            ))}
            <button
              onClick={() => setBet(maxBet)}
              className="px-3 py-1 rounded-full text-xs border border-yellow-600 text-yellow-400 hover:bg-yellow-900/30"
            >
              MAX
            </button>
          </div>

          <Button
            onClick={freeDropUsed ? watchAdAndDrop : drop}
            disabled={dropping}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold"
          >
            {dropping ? "Летит..." : freeDropUsed ? "Смотреть рекламу = ещё раз" : `Бросить ${bet.toLocaleString()} 🥕`}
          </Button>
          {!freeDropUsed && (
            <p className="text-center text-xs text-green-400">1 бесплатный бросок!</p>
          )}
        </Card>
      </div>
    </div>
  )
}

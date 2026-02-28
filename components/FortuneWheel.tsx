"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Prize definitions
const PRIZES = [
  { id: 1, label: "+50-500 🥕", color: "#f97316", type: "carrots" as const, min: 50, max: 500, prob: 25 },
  { id: 2, label: "+500-2500 🥕", color: "#ea580c", type: "carrots" as const, min: 500, max: 2500, prob: 25 },
  { id: 3, label: "+100 Energy", color: "#22c55e", type: "energy" as const, min: 100, max: 300, prob: 13 },
  { id: 4, label: "+300-1000 Energy", color: "#16a34a", type: "energy" as const, min: 300, max: 1000, prob: 12 },
  { id: 5, label: "Auto-tap 30m", color: "#8b5cf6", type: "autotap" as const, duration: 30, prob: 5 },
  { id: 6, label: "Auto-tap 60m", color: "#7c3aed", type: "autotap" as const, duration: 60, prob: 2 },
  { id: 7, label: "x2 Boost 30m", color: "#ec4899", type: "booster" as const, duration: 30, prob: 7 },
  { id: 8, label: "x2 Boost 60m", color: "#db2777", type: "booster" as const, duration: 60, prob: 3 },
  { id: 9, label: "+0.01 GT", color: "#eab308", type: "gt" as const, min: 0.01, max: 0.03, prob: 5 },
  { id: 10, label: "+0.05-0.1 GT", color: "#ca8a04", type: "gt" as const, min: 0.05, max: 0.1, prob: 3 },
]

interface FortuneWheelProps {
  spinsLeft: number
  onSpin: () => void
  onPrize: (prize: typeof PRIZES[number], value: number) => void
  canSpin: boolean
}

function weightedRandom() {
  const totalProb = PRIZES.reduce((s, p) => s + p.prob, 0)
  let r = Math.random() * totalProb
  for (const prize of PRIZES) {
    r -= prize.prob
    if (r <= 0) return prize
  }
  return PRIZES[0]
}

export default function FortuneWheel({ spinsLeft, onSpin, onPrize, canSpin }: FortuneWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [lastPrize, setLastPrize] = useState<{ prize: typeof PRIZES[number]; value: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const segmentAngle = 360 / PRIZES.length

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 4

    ctx.clearRect(0, 0, size, size)

    PRIZES.forEach((prize, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180)
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180)

      // Segment
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = prize.color
      ctx.fill()
      ctx.strokeStyle = "#1e1b4b"
      ctx.lineWidth = 2
      ctx.stroke()

      // Text
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + (endAngle - startAngle) / 2)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.shadowColor = "#000"
      ctx.shadowBlur = 3
      const text = prize.label.length > 14 ? prize.label.substring(0, 12) + ".." : prize.label
      ctx.fillText(text, radius * 0.6, 4)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(center, center, 18, 0, Math.PI * 2)
    ctx.fillStyle = "#1e1b4b"
    ctx.fill()
    ctx.strokeStyle = "#a78bfa"
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = "#fff"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("SPIN", center, center)
  }, [])

  const spin = () => {
    if (spinning || !canSpin || spinsLeft <= 0) return

    setSpinning(true)
    onSpin()

    const prize = weightedRandom()
    const prizeIndex = PRIZES.findIndex((p) => p.id === prize.id)

    // Calculate target rotation
    const targetSegment = prizeIndex * segmentAngle
    const fullRotations = 5 + Math.floor(Math.random() * 3)
    const randomOffset = Math.random() * (segmentAngle * 0.6) + segmentAngle * 0.2
    const totalRotation = fullRotations * 360 + (360 - targetSegment - randomOffset)

    setRotation((prev) => prev + totalRotation)

    // Prize value
    let value = 0
    if ("min" in prize && "max" in prize) {
      if (prize.type === "gt") {
        value = Math.round((prize.min + Math.random() * (prize.max - prize.min)) * 100) / 100
      } else {
        value = Math.floor(prize.min + Math.random() * (prize.max - prize.min))
      }
    } else if ("duration" in prize) {
      value = prize.duration
    }

    setTimeout(() => {
      setSpinning(false)
      setLastPrize({ prize, value })
      setShowResult(true)
      onPrize(prize, value)
    }, 4000)
  }

  const getPrizeText = () => {
    if (!lastPrize) return ""
    const { prize, value } = lastPrize
    switch (prize.type) {
      case "carrots": return `+${value.toLocaleString()} morkovok!`
      case "energy": return `+${value} energii!`
      case "gt": return `+${value.toFixed(2)} GT!`
      case "autotap": return `Auto-tap na ${value} minut!`
      case "booster": return `x2 morkovok na ${value} minut!`
      default: return "Priz!"
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold text-white text-center">Koleso Fortuny</h2>

      <Card className="bg-black/30 border-purple-500/30 px-4 py-2">
        <span className="text-sm text-gray-300">
          Popytki segodnya: <span className="font-bold text-yellow-400">{spinsLeft}</span>/3
        </span>
      </Card>

      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-lg" />
        </div>

        <div
          className="transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? "4s" : "0s",
            transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-full border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          />
        </div>
      </div>

      <Button
        onClick={spin}
        disabled={spinning || !canSpin || spinsLeft <= 0}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-3 h-auto disabled:opacity-40 shadow-lg"
      >
        {spinning ? "Krutitsya..." : spinsLeft <= 0 ? "Popytki zakonchilis'" : "Krutit' za reklamu"}
      </Button>

      {/* Result dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-black/95 backdrop-blur-md border-yellow-500/50 text-white max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-yellow-400">
              Pozdravlyaem!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-3 py-4">
            <div className="text-5xl">{lastPrize?.prize.type === "carrots" ? "🥕" : lastPrize?.prize.type === "energy" ? "⚡" : lastPrize?.prize.type === "gt" ? "💰" : lastPrize?.prize.type === "autotap" ? "🤖" : "🚀"}</div>
            <p className="text-xl font-bold">{getPrizeText()}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

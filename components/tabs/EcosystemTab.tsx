"use client"

import { useMemo, useState } from "react"
import { Award, Clock3, Compass, Gift, Globe2, LockKeyhole, Package, Pickaxe, Send, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Expedition = { id: string; title: string; duration: string; minutes: number; reward: string; icon: string }

const expeditions: Expedition[] = [
  { id: "field", title: "Морковное поле", duration: "30 минут", minutes: 30, reward: "+12 000 морковок", icon: "🥕" },
  { id: "cave", title: "Пещера руды", duration: "2 часа", minutes: 120, reward: "+1 GT и предмет", icon: "⛏️" },
  { id: "station", title: "Космическая станция", duration: "8 часов", minutes: 480, reward: "Редкий предмет", icon: "🚀" },
]

const collection = [
  { title: "Экипировка фермера", items: 3, total: 5, reward: "+2% скорость майнеров", icon: "🧺" },
  { title: "Забытые артефакты", items: 1, total: 5, reward: "+0.5 MS", icon: "🏺" },
  { title: "Космические манускрипты", items: 0, total: 5, reward: "Эксклюзивный фон", icon: "📜" },
]

interface EcosystemTabProps {
  ms: number
  carrots: number
  onGain: (carrots: number, ms: number) => void
  onGift: () => void
}

export default function EcosystemTab({ ms, carrots, onGain, onGift }: EcosystemTabProps) {
  const [activeExpedition, setActiveExpedition] = useState<string | null>(null)
  const [eventProgress, setEventProgress] = useState(68_400_000_000)
  const [message, setMessage] = useState("")
  const merchant = useMemo(() => new Date().getHours() % 2 === 0, [])

  const startExpedition = (expedition: Expedition) => {
    if (activeExpedition) return
    setActiveExpedition(expedition.id)
    setMessage(`${expedition.title} началась. Награда будет готова после возвращения.`)
    window.setTimeout(() => {
      setActiveExpedition(null)
      onGain(expedition.id === "field" ? 12000 : 2500, expedition.id === "cave" ? 0.5 : 0.15)
      setMessage(`Экспедиция завершена: ${expedition.reward}`)
    }, 3000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[0.2em] text-blue-200/60">Мир Guinea Pig</p><h2 className="text-2xl font-bold text-white">Экосистема</h2></div>
        <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-right"><p className="text-[10px] text-cyan-100/70">Mining Score</p><p className="font-mono font-bold text-cyan-200">{ms.toFixed(2)} MS</p></div>
      </div>

      {message && <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">{message}</div>}

      <Card className="border-cyan-300/20 bg-slate-950/35 p-4 text-white">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-cyan-300" /><div><h3 className="font-semibold">Глобальное событие</h3><p className="text-xs text-white/55">Все игроки строят первую эру</p></div></div><span className="text-xs text-cyan-200">68%</span></div>
        <Progress value={(eventProgress / 100_000_000_000) * 100} className="h-2" />
        <div className="mt-2 flex justify-between text-[11px] text-white/55"><span>{(eventProgress / 1_000_000_000).toFixed(1)}B морковок</span><span>100B цель</span></div>
        <Button className="mt-3 w-full bg-cyan-600 hover:bg-cyan-500" onClick={() => { const amount = Math.min(carrots, 100000); if (amount) { onGain(-amount, amount >= 100000 ? 0.1 : 0); setEventProgress(p => p + amount) } }}>Внести 100 000 морковок <Send className="ml-2 h-3.5 w-3.5" /></Button>
      </Card>

      <section><div className="mb-2 flex items-center gap-2"><Compass className="h-4 w-4 text-orange-300" /><h3 className="font-semibold text-white">Экспедиции</h3><span className="text-xs text-white/45">награды за ожидание</span></div><div className="grid gap-2 sm:grid-cols-3">{expeditions.map((item) => <Card key={item.id} className="border-white/10 bg-white/5 p-3 text-white"><div className="flex items-start justify-between"><span className="text-2xl">{item.icon}</span><Clock3 className="h-4 w-4 text-white/45" /></div><h4 className="mt-2 text-sm font-semibold">{item.title}</h4><p className="text-xs text-white/50">{item.duration} · {item.reward}</p><Button size="sm" className="mt-3 w-full bg-orange-600 hover:bg-orange-500" disabled={!!activeExpedition} onClick={() => startExpedition(item)}>{activeExpedition === item.id ? "В пути..." : "Отправить"}</Button></Card>)}</div></section>

      <section><div className="mb-2 flex items-center gap-2"><Package className="h-4 w-4 text-violet-300" /><h3 className="font-semibold text-white">Альбом коллекций</h3></div><div className="space-y-2">{collection.map((item) => <div key={item.title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><span className="text-xl">{item.icon}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-2 text-sm"><span className="truncate font-medium text-white">{item.title}</span><span className="text-white/55">{item.items}/{item.total}</span></div><Progress value={(item.items / item.total) * 100} className="mt-2 h-1.5" /><p className="mt-1 text-[11px] text-white/45">Награда: {item.reward}</p></div>{item.items === item.total ? <Award className="h-4 w-4 text-yellow-300" /> : <LockKeyhole className="h-4 w-4 text-white/30" />}</div>)}</div></section>

      <div className="grid gap-2 sm:grid-cols-2"><Card className="border-pink-300/20 bg-pink-300/10 p-4 text-white"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-pink-200" /><h3 className="font-semibold">Тайный торговец</h3></div><p className="mt-1 text-xs text-white/60">{merchant ? "Сегодня доступен редкий скин и буст" : "Появится в ближайшее время"}</p><Button size="sm" className="mt-3 bg-pink-600 hover:bg-pink-500" disabled={!merchant}>Открыть лавку</Button></Card><Card className="border-yellow-300/20 bg-yellow-300/10 p-4 text-white"><div className="flex items-center gap-2"><Gift className="h-4 w-4 text-yellow-200" /><h3 className="font-semibold">Социалка</h3></div><p className="mt-1 text-xs text-white/60">Подарок и именное сообщение в глобальный чат</p><Button size="sm" className="mt-3 bg-yellow-600 hover:bg-yellow-500" onClick={onGift}>Отправить подарок</Button></Card></div>
      <p className="flex items-center gap-2 text-[11px] text-white/45"><Users className="h-3.5 w-3.5" /> MS нельзя купить — только заработать активностью и майнингом.</p>
    </div>
  )
}

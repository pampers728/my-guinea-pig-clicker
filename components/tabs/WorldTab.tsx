"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Backpack, Castle, ChevronRight, Crosshair, Crown, Gem, Heart, Map, MessageCircle, Moon, MoreHorizontal, Move, Navigation, Radio, ScrollText, Shield, Sparkles, Swords, Target, Users, Zap } from "lucide-react"

type Territory = { name: string; status: "open" | "raid" | "locked"; reward: string; control: number }
type WorldTabProps = { factionName: string; factionPower: number; personalContribution: number; activeTerritory: string; onJoinExpedition: () => void; onSupportFaction: () => void; season: number; seasonDaysLeft: number; title: string; territories: Territory[] }

const chat = [
  ["Mira", "Северный мост открыт!"],
  ["Raven", "Нужен хил у кристалла"],
  ["Kiro", "Босс появится через 18 мин"],
]

const zones = [
  { name: "Морковный порт", x: "14%", y: "58%", icon: Castle, tone: "text-amber-200" },
  { name: "Туманные поля", x: "45%", y: "30%", icon: Sparkles, tone: "text-cyan-200" },
  { name: "Кристальный рифт", x: "72%", y: "54%", icon: Gem, tone: "text-fuchsia-200" },
  { name: "Бурый перевал", x: "58%", y: "79%", icon: Shield, tone: "text-red-200" },
]

export default function WorldTab({ factionName, factionPower, personalContribution, onJoinExpedition, onSupportFaction, season, seasonDaysLeft, title }: WorldTabProps) {
  const [selectedZone, setSelectedZone] = useState("Кристальный рифт")
  const [notice, setNotice] = useState("")
  const [hp, setHp] = useState(78)
  const [energy, setEnergy] = useState(64)
  const [questProgress, setQuestProgress] = useState(2)

  const act = (message: string, callback?: () => void) => {
    callback?.()
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2600)
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#10131c] text-white shadow-2xl">
      <div className="relative min-h-[650px] overflow-hidden bg-[#7c6445] sm:min-h-[720px]">
        <div className="absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_10%_20%,rgba(255,218,147,.34)_0_2%,transparent_2.5%),radial-gradient(circle_at_80%_30%,rgba(53,77,48,.52)_0_14%,transparent_14.5%),radial-gradient(circle_at_34%_70%,rgba(58,79,52,.55)_0_17%,transparent_17.5%),linear-gradient(135deg,#9a805c_0%,#6b634c_48%,#8c704e_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(24deg,transparent_45%,rgba(255,230,165,.24)_46%,transparent_48%),linear-gradient(114deg,transparent_46%,rgba(46,39,29,.22)_47%,transparent_49%)] [background-size:85px_65px,120px_90px]" />
        <div className="absolute left-[21%] top-[17%] h-24 w-44 rotate-[-12deg] rounded-full bg-[#b7a574]/50 blur-sm" />
        <div className="absolute right-[18%] top-[40%] h-32 w-52 rotate-[14deg] rounded-full bg-[#3e694d]/55 blur-sm" />
        <div className="absolute bottom-[13%] left-[37%] h-20 w-48 rotate-[-7deg] rounded-full bg-[#d1a46a]/50 blur-sm" />

        <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 bg-gradient-to-b from-black/75 to-transparent p-3 sm:p-4">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-2 py-1.5 backdrop-blur-md">
            <div className="grid size-10 place-items-center rounded-full border-2 border-amber-200 bg-gradient-to-br from-amber-400 to-red-700 text-lg font-black text-white shadow-lg">G</div>
            <div className="min-w-0"><p className="max-w-[110px] truncate text-xs font-black">Guinea Warden</p><p className="text-[9px] text-amber-200">LVL 24 · {title}</p><div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-black/60"><div className="h-full w-[78%] bg-red-500" /><div className="-mt-1.5 h-full w-[64%] bg-cyan-400" /></div></div>
          </div>
          <div className="flex items-start gap-2"><div className="hidden rounded-xl border border-white/20 bg-black/55 px-3 py-2 text-right backdrop-blur-md sm:block"><p className="text-[9px] uppercase tracking-widest text-amber-200">Сезон {season}</p><p className="text-sm font-black">Морская граница</p><p className="text-[10px] text-slate-300">До смены мира: {seasonDaysLeft} дн.</p></div><div className="grid size-11 place-items-center rounded-xl border border-white/20 bg-black/55"><Map className="size-5 text-amber-200" /></div></div>
        </header>

        <div className="absolute left-3 top-[92px] z-20 w-[min(235px,62%)] rounded-xl border border-amber-100/20 bg-[#211b18]/75 p-3 shadow-xl backdrop-blur-md sm:left-4"><div className="flex items-start gap-2"><ScrollText className="mt-0.5 size-4 shrink-0 text-amber-300" /><div><p className="text-[9px] uppercase tracking-widest text-amber-200">Главное задание</p><p className="mt-1 text-xs font-bold">Остановить рейд у Кристального рифта</p><p className="mt-2 text-[10px] text-slate-300">Участники: {Math.round(factionPower / 6)} · Прогресс {questProgress}/3</p><Progress value={(questProgress / 3) * 100} className="mt-1 h-1 bg-white/15" /></div></div></div>

        <div className="absolute right-3 top-[88px] z-20 w-28 overflow-hidden rounded-2xl border-2 border-black/60 bg-[#8c805e]/80 shadow-xl sm:right-4 sm:w-36"><div className="relative aspect-square [background-image:radial-gradient(circle_at_30%_25%,#d6bd7c_0_8%,transparent_8.5%),radial-gradient(circle_at_70%_70%,#385d4e_0_18%,transparent_18.5%),linear-gradient(135deg,#5e8160,#c1a978)]"><div className="absolute left-[45%] top-[42%] size-3 rounded-full bg-red-400 ring-4 ring-red-300/30" /><div className="absolute bottom-1 left-2 text-[8px] font-bold text-white drop-shadow">МИНИ-КАРТА</div></div></div>

        <div className="absolute inset-x-0 top-[25%] z-10 mx-auto h-[48%] w-[78%] sm:top-[24%] sm:h-[52%] sm:w-[72%]">
          {zones.map((zone) => { const Icon = zone.icon; return <button type="button" key={zone.name} onClick={() => { setSelectedZone(zone.name); act(`${zone.name} выбрана`) }} className={`absolute -translate-x-1/2 -translate-y-1/2 transition hover:scale-110 ${selectedZone === zone.name ? "scale-110" : ""}`} style={{ left: zone.x, top: zone.y }}><div className={`grid size-12 place-items-center rounded-full border-2 border-white/70 bg-black/60 shadow-[0_5px_0_rgba(0,0,0,.25)] ${selectedZone === zone.name ? "ring-4 ring-amber-300/50" : ""}`}><Icon className={`size-5 ${zone.tone}`} /></div><span className="mt-1 block whitespace-nowrap rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold shadow">{zone.name}</span></button> })}
          <div className="absolute left-[55%] top-[53%] -translate-x-1/2 -translate-y-1/2"><div className="relative grid size-14 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-amber-300 to-red-700 shadow-[0_6px_0_rgba(0,0,0,.3)]"><div className="size-4 rounded-full bg-white/80" /><div className="absolute -top-5 whitespace-nowrap rounded bg-black/60 px-2 py-1 text-[9px] font-black">Ты · {factionName}</div></div></div>
          <div className="absolute left-[38%] top-[58%] grid size-9 place-items-center rounded-full bg-red-950/80 text-red-200 shadow-lg"><Swords className="size-4" /></div><div className="absolute left-[65%] top-[38%] grid size-8 place-items-center rounded-full bg-fuchsia-950/80 text-fuchsia-200 shadow-lg"><Gem className="size-4" /></div>
        </div>

        <div className="absolute bottom-[160px] left-3 z-20 w-[min(235px,62%)] rounded-xl border border-white/15 bg-black/55 p-2.5 backdrop-blur-md sm:bottom-4 sm:left-4"><div className="mb-1 flex items-center gap-1 text-[9px] font-bold text-cyan-200"><MessageCircle className="size-3" /> МИРОВОЙ ЧАТ</div>{chat.map(([name, text]) => <p key={name} className="truncate text-[10px] leading-4"><span className="font-black text-amber-200">{name}:</span> <span className="text-slate-200">{text}</span></p>)}</div>

        <div className="absolute bottom-4 left-4 z-20 grid size-20 place-items-center rounded-full border-4 border-white/30 bg-black/25 shadow-inner sm:size-24"><Move className="size-8 text-white/70" /><span className="absolute bottom-1 text-[8px] text-white/60">ДВИЖЕНИЕ</span></div>
        <div className="absolute bottom-4 right-3 z-20 flex items-end gap-2 sm:right-5"><Button size="icon" onClick={() => act("Цель захвачена")} className="size-11 rounded-full border border-white/30 bg-black/55 text-white hover:bg-black/70"><Crosshair className="size-5" /></Button><Button size="icon" onClick={() => act("Удар нанесён")} className="size-16 rounded-full border-2 border-amber-200/70 bg-red-700/80 text-white shadow-[0_5px_0_rgba(80,20,10,.5)] hover:bg-red-600"><Swords className="size-7" /></Button><div className="flex flex-col gap-2"><Button size="icon" onClick={() => { setEnergy((value) => Math.max(0, value - 12)); act("Способность активирована") }} className="size-11 rounded-full border border-cyan-200/60 bg-cyan-700/80 text-white"><Zap className="size-5" /></Button><Button size="icon" onClick={() => { setHp((value) => Math.min(100, value + 8)); act("Щит восстановил здоровье") }} className="size-11 rounded-full border border-emerald-200/60 bg-emerald-700/80 text-white"><Heart className="size-5" /></Button></div></div>

        <div className="absolute bottom-[112px] right-3 z-20 flex gap-1 rounded-xl border border-white/15 bg-black/50 p-1.5 backdrop-blur-md sm:bottom-28 sm:right-5"><Button size="icon" variant="ghost" onClick={() => act("Инвентарь открыт")} className="size-9 text-amber-100 hover:bg-white/15"><Backpack className="size-4" /></Button><Button size="icon" variant="ghost" onClick={() => act("Гильдия открыта")} className="size-9 text-amber-100 hover:bg-white/15"><Users className="size-4" /></Button><Button size="icon" variant="ghost" onClick={() => act("Квесты открыты")} className="size-9 text-amber-100 hover:bg-white/15"><ScrollText className="size-4" /></Button></div>

        {notice && <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-amber-200/40 bg-black/75 px-4 py-3 text-center text-xs font-bold text-amber-100 shadow-2xl backdrop-blur-md" role="status">{notice}</div>}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-[#151925] p-3 text-xs sm:grid-cols-4"><div className="rounded-xl border border-white/10 bg-white/[.03] p-2"><p className="text-[9px] uppercase tracking-wider text-slate-500">Локация</p><p className="mt-1 truncate font-bold text-amber-100">{selectedZone}</p></div><div className="rounded-xl border border-white/10 bg-white/[.03] p-2"><p className="text-[9px] uppercase tracking-wider text-slate-500">HP / энергия</p><p className="mt-1 font-bold text-red-200">{hp}% <span className="text-cyan-200">/ {energy}%</span></p></div><div className="rounded-xl border border-white/10 bg-white/[.03] p-2"><p className="text-[9px] uppercase tracking-wider text-slate-500">Личный вклад</p><p className="mt-1 font-bold text-amber-200">{personalContribution.toLocaleString()}</p></div><Button onClick={() => act("Экспедиция начата", onJoinExpedition)} className="h-auto min-h-12 rounded-xl bg-amber-600 text-xs font-black hover:bg-amber-500"><Navigation className="mr-1 size-4" /> В экспедицию</Button></div>
      <div className="flex items-center justify-between border-t border-white/10 bg-[#0e1119] px-3 py-2 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Radio className="size-3 text-emerald-300" /> Мир онлайн · 1 284 игрока</span><button type="button" onClick={() => act("Глобальная карта синхронизируется")}>Синхронизировать <ChevronRight className="inline size-3" /></button></div>
    </div>
  )
}

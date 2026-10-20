"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Map, Swords, Shield, Compass, LockKeyhole, Trophy, Clock3, Users, ChevronRight } from "lucide-react"

type Territory = { name: string; status: "open" | "raid" | "locked"; reward: string; control: number }

type WorldTabProps = {
  factionName: string
  factionPower: number
  personalContribution: number
  activeTerritory: string
  onJoinExpedition: () => void
  onSupportFaction: () => void
  season: number
  seasonDaysLeft: number
  title: string
  territories: Territory[]
}

export default function WorldTab({ factionName, factionPower, personalContribution, activeTerritory, onJoinExpedition, onSupportFaction, season, seasonDaysLeft, title, territories }: WorldTabProps) {
  const nextMilestone = useMemo(() => Math.min(100, Math.round((factionPower / 10000) * 100)), [factionPower])

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-cyan-400/30 bg-gradient-to-br from-cyan-950/70 to-purple-950/60 p-4 text-white shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-300"><Map className="size-4" /> Живой мир</div>
            <h2 className="text-xl font-black">Сезон {season}: Битва за территории</h2>
            <p className="mt-1 text-xs text-slate-300">Карта меняется каждую неделю. Победа открывает новые игровые возможности для всех.</p>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-cyan-400/15 text-cyan-200"><Clock3 className="mr-1 size-3" /> {seasonDaysLeft} дн.</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[11px] text-slate-400">Фракция</p><p className="font-bold text-cyan-200">{factionName}</p></div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[11px] text-slate-400">Твой вклад</p><p className="font-bold text-amber-300">{personalContribution.toLocaleString()} очков</p></div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs"><span>Сила фракции: {factionPower.toLocaleString()}</span><span className="text-cyan-300">До новой награды {Math.max(0, 10000 - factionPower).toLocaleString()}</span></div>
        <Progress value={nextMilestone} className="mt-2 h-2 bg-white/10" />
        <div className="mt-3 flex gap-2"><Button onClick={onJoinExpedition} className="flex-1 bg-cyan-600 hover:bg-cyan-500"><Compass className="mr-2 size-4" /> В экспедицию</Button><Button onClick={onSupportFaction} variant="outline" className="border-cyan-400/40 bg-transparent text-cyan-100"><Swords className="size-4" /></Button></div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {territories.map((territory) => {
          const locked = territory.status === "locked"
          return <Card key={territory.name} className={`border-white/10 bg-black/25 p-4 text-white ${territory.name === activeTerritory ? "ring-1 ring-cyan-300/70" : ""}`}>
            <div className="flex items-start justify-between"><div className="flex items-center gap-2"><div className={`rounded-lg p-2 ${locked ? "bg-slate-800 text-slate-500" : territory.status === "raid" ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>{locked ? <LockKeyhole className="size-4" /> : territory.status === "raid" ? <Swords className="size-4" /> : <Shield className="size-4" />}</div><div><h3 className="font-bold">{territory.name}</h3><p className="text-[11px] text-slate-400">{locked ? "Откроется после победы" : territory.status === "raid" ? "Идёт рейд" : "Под контролем"}</p></div></div><ChevronRight className="size-4 text-slate-500" /></div>
            {!locked && <><div className="mt-3 flex justify-between text-xs text-slate-400"><span>Контроль</span><span>{territory.control}%</span></div><Progress value={territory.control} className="mt-1 h-1.5" /><p className="mt-3 text-xs text-amber-200">Награда: {territory.reward}</p></>}
          </Card>
        })}
      </div>

      <Card className="border-purple-400/20 bg-purple-950/30 p-4 text-white"><div className="flex items-center gap-2"><Trophy className="size-5 text-amber-300" /><h3 className="font-bold">Профиль героя</h3></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-black/20 p-3"><p className="text-slate-400">Титул</p><p className="mt-1 font-bold text-amber-200">{title}</p></div><div className="rounded-lg bg-black/20 p-3"><p className="text-slate-400">История сезона</p><p className="mt-1 font-bold text-purple-200">Сезон {season} · участник</p></div></div><div className="mt-3 flex items-center gap-2 text-xs text-slate-300"><Users className="size-4 text-cyan-300" /> Бесплатная активность влияет на исход битвы так же, как покупки.</div></Card>
    </div>
  )
}

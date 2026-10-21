"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Map, Swords, Shield, Compass, LockKeyhole, Trophy, Clock3, Users, ChevronRight, Crown, Flame, Gem, Crosshair, Backpack, Sparkles, Castle, ScrollText, Zap, Heart, Target } from "lucide-react"

type Territory = { name: string; status: "open" | "raid" | "locked"; reward: string; control: number }
type WorldTabProps = { factionName: string; factionPower: number; personalContribution: number; activeTerritory: string; onJoinExpedition: () => void; onSupportFaction: () => void; season: number; seasonDaysLeft: number; title: string; territories: Territory[] }

type Zone = { name: string; type: string; level: string; icon: string; color: string; status: string; detail: string }

const zones: Zone[] = [
  { name: "Морковный порт", type: "Стартовая зона", level: "1–10", icon: "⚓", color: "border-emerald-400/50 bg-emerald-500/10", status: "Ваша база", detail: "Торговцы, гильдии и ежедневные поручения" },
  { name: "Туманные поля", type: "PvE · экспедиции", level: "10–25", icon: "🌫️", color: "border-cyan-400/50 bg-cyan-500/10", status: "Открыто", detail: "Собери отряд и найди древний артефакт" },
  { name: "Кристальный рифт", type: "PvP · рейд", level: "25–50", icon: "💎", color: "border-fuchsia-400/50 bg-fuchsia-500/10", status: "Рейд недели", detail: "Вклад фракции меняет контроль территории" },
  { name: "Логово Бурого босса", type: "World Boss", level: "50+", icon: "🐻", color: "border-amber-400/50 bg-amber-500/10", status: "Скоро", detail: "Откроется после захвата Кристального рифта" },
]

const classes = [
  { name: "Следопыт", icon: "🏹", note: "+15% к экспедициям", color: "text-cyan-300" },
  { name: "Страж", icon: "🛡️", note: "+15% к защите фракции", color: "text-emerald-300" },
  { name: "Алхимик", icon: "🧪", note: "+10% к артефактам", color: "text-fuchsia-300" },
]

const factions = [
  { name: "Солнечная нора", icon: "☀️", color: "border-amber-400/50 bg-amber-500/10", motto: "Строим будущее вместе", bonus: "Строительство +10%" },
  { name: "Туманный круг", icon: "🌙", color: "border-cyan-400/50 bg-cyan-500/10", motto: "Знание меняет мир", bonus: "Экспедиции +10%" },
  { name: "Кристальный легион", icon: "💠", color: "border-fuchsia-400/50 bg-fuchsia-500/10", motto: "Сила в единстве", bonus: "Защита +10%" },
]

const artifacts = [
  { name: "Осколок первого рассвета", icon: "☀️", rarity: "Легендарный", effect: "+5% к очкам вклада" },
  { name: "Компас потерянных троп", icon: "🧭", rarity: "Эпический", effect: "+1 награда в экспедиции" },
  { name: "Печать хранителя", icon: "🜲", rarity: "Редкий", effect: "Щит базы на 2 часа" },
]

export default function WorldTab({ factionName, factionPower, personalContribution, activeTerritory, onJoinExpedition, onSupportFaction, season, seasonDaysLeft, title, territories }: WorldTabProps) {
  const [mode, setMode] = useState<"map" | "hero" | "event">("map")
  const [selectedZone, setSelectedZone] = useState(zones[1].name)
  const [selectedClass, setSelectedClass] = useState(classes[0].name)
  const [selectedFaction, setSelectedFaction] = useState(factionName)
  const [actionMessage, setActionMessage] = useState("")
  const nextMilestone = useMemo(() => Math.min(100, Math.round((factionPower / 10000) * 100)), [factionPower])
  const zone = zones.find((item) => item.name === selectedZone) ?? zones[0]

  const runAction = (message: string, action?: () => void) => {
    action?.()
    setActionMessage(message)
    window.setTimeout(() => setActionMessage(""), 2600)
  }

  return <div className="flex flex-col gap-4">
    <Card className="border-cyan-400/30 bg-gradient-to-br from-cyan-950/70 to-purple-950/60 p-4 text-white shadow-xl">
      <div className="flex items-start justify-between gap-3"><div><div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-300"><Map className="size-4" /> Живой мир</div><h2 className="text-xl font-black">Сезон {season}: Битва за территории</h2><p className="mt-1 text-xs text-slate-300">MMO-мир меняется каждую неделю: победа открывает новые маршруты, классы и награды.</p></div><Badge variant="secondary" className="shrink-0 bg-cyan-400/15 text-cyan-200"><Clock3 className="mr-1 size-3" /> {seasonDaysLeft} дн.</Badge></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[11px] text-slate-400">Фракция</p><p className="font-bold text-cyan-200">{factionName}</p></div><div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[11px] text-slate-400">Твой вклад</p><p className="font-bold text-amber-300">{personalContribution.toLocaleString()} очков</p></div></div>
      <div className="mt-4 flex items-center justify-between text-xs"><span>Сила фракции: {factionPower.toLocaleString()}</span><span className="text-cyan-300">До новой награды {Math.max(0, 10000 - factionPower).toLocaleString()}</span></div><Progress value={nextMilestone} className="mt-2 h-2 bg-white/10" />
      <div className="mt-3 flex gap-2"><Button onClick={() => runAction("Экспедиция началась — награда появится после возвращения", onJoinExpedition)} className="flex-1 bg-cyan-600 hover:bg-cyan-500"><Compass className="mr-2 size-4" /> В экспедицию</Button><Button onClick={() => runAction("+50 очков отправлено фракции", onSupportFaction)} variant="outline" className="border-cyan-400/40 bg-transparent text-cyan-100"><Swords className="size-4" /></Button></div>
      {actionMessage && <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100" role="status">{actionMessage}</div>}
    </Card>

    <Card className="border-amber-400/20 bg-gradient-to-r from-amber-950/40 to-cyan-950/30 p-4 text-white"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">Выбор империи</p><h3 className="mt-1 font-black">Твоя фракция определяет путь сезона</h3></div><Badge variant="outline" className="border-amber-300/30 text-amber-200">{selectedFaction}</Badge></div><div className="mt-3 grid gap-2 sm:grid-cols-3">{factions.map((faction) => <button type="button" key={faction.name} onClick={() => { setSelectedFaction(faction.name); runAction(`${faction.name} принята в хронику героя`) }} className={`rounded-xl border p-3 text-left transition hover:scale-[1.01] ${faction.color} ${selectedFaction === faction.name ? "ring-2 ring-amber-300" : "opacity-75"}`}><div className="flex items-center justify-between"><span className="text-xl">{faction.icon}</span>{selectedFaction === faction.name && <Badge className="bg-amber-400/20 text-amber-100">Выбрано</Badge>}</div><p className="mt-2 text-sm font-bold">{faction.name}</p><p className="mt-1 text-[10px] text-slate-300">{faction.motto}</p><p className="mt-2 text-[10px] font-semibold text-amber-200">{faction.bonus}</p></button>)}</div></Card>

    <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/20 p-1"><Button size="sm" onClick={() => setMode("map")} variant={mode === "map" ? "secondary" : "ghost"} className="text-xs"><Map className="mr-1 size-3" />Карта</Button><Button size="sm" onClick={() => setMode("hero")} variant={mode === "hero" ? "secondary" : "ghost"} className="text-xs"><Backpack className="mr-1 size-3" />Герой</Button><Button size="sm" onClick={() => setMode("event")} variant={mode === "event" ? "secondary" : "ghost"} className="text-xs"><Zap className="mr-1 size-3" />Событие</Button></div>

    {mode === "map" && <>
      <Card className="border-indigo-400/30 bg-[#101638]/80 p-4 text-white"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-indigo-300">WorldBox-style карта</p><h3 className="mt-1 text-lg font-black">Континент Морквард</h3></div><Badge className="bg-fuchsia-500/20 text-fuchsia-200">Неделя 3</Badge></div><div className="relative mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,.18),transparent_42%),linear-gradient(135deg,#172554,#312e81)] p-3"><div className="pointer-events-none absolute inset-x-6 top-1/2 border-t border-dashed border-cyan-300/40" />{zones.map((item, index) => <button type="button" key={item.name} onClick={() => setSelectedZone(item.name)} className={`relative rounded-xl border p-3 text-left transition hover:scale-[1.02] ${item.color} ${index === 3 ? "opacity-70" : ""} ${selectedZone === item.name ? "ring-2 ring-white/70" : ""}`}><div className="flex items-start justify-between"><span className="text-2xl">{item.icon}</span>{index === 0 ? <Crown className="size-4 text-amber-300" /> : index === 2 ? <Flame className="size-4 text-orange-300" /> : null}</div><p className="mt-2 text-sm font-bold">{item.name}</p><p className="text-[10px] text-slate-300">{item.type} · {item.level}</p><Badge variant="outline" className="mt-2 border-white/20 text-[10px] text-slate-200">{item.status}</Badge></button>)}</div><div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3"><div className="flex items-center gap-2"><Castle className="size-4 text-cyan-300" /><p className="text-sm font-bold">{zone.name}</p></div><p className="mt-1 text-xs text-slate-300">{zone.detail}</p></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-300"><div><Crosshair className="mx-auto mb-1 size-4 text-red-300" />PvP-рейды</div><div><Gem className="mx-auto mb-1 size-4 text-fuchsia-300" />Артефакты</div><div><Sparkles className="mx-auto mb-1 size-4 text-amber-300" />События</div></div></Card>
      <div className="grid gap-3 sm:grid-cols-2">{territories.map((territory) => { const locked = territory.status === "locked"; return <Card key={territory.name} className={`border-white/10 bg-black/25 p-4 text-white ${territory.name === activeTerritory ? "ring-1 ring-cyan-300/70" : ""}`}><div className="flex items-start justify-between"><div className="flex items-center gap-2"><div className={`rounded-lg p-2 ${locked ? "bg-slate-800 text-slate-500" : territory.status === "raid" ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>{locked ? <LockKeyhole className="size-4" /> : territory.status === "raid" ? <Swords className="size-4" /> : <Shield className="size-4" />}</div><div><h3 className="font-bold">{territory.name}</h3><p className="text-[11px] text-slate-400">{locked ? "Откроется после победы" : territory.status === "raid" ? "Идёт рейд" : "Под контролем"}</p></div></div><ChevronRight className="size-4 text-slate-500" /></div>{!locked && <><div className="mt-3 flex justify-between text-xs text-slate-400"><span>Контроль</span><span>{territory.control}%</span></div><Progress value={territory.control} className="mt-1 h-1.5" /><p className="mt-3 text-xs text-amber-200">Награда: {territory.reward}</p></>}</Card>})}</div>
    </>}

    {mode === "hero" && <Card className="border-amber-400/20 bg-amber-950/20 p-4 text-white"><div className="flex items-center gap-2"><Trophy className="size-5 text-amber-300" /><div><h3 className="font-bold">Профиль героя</h3><p className="text-xs text-slate-400">Твой прогресс остаётся с тобой в любом сезоне</p></div></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-black/20 p-3"><p className="text-slate-400">Титул</p><p className="font-bold text-amber-200">{title}</p></div><div className="rounded-lg bg-black/20 p-3"><p className="text-slate-400">Артефакты</p><p className="font-bold text-fuchsia-200">7 / 24</p></div></div><p className="mt-4 text-xs font-semibold text-slate-300">Летопись сезона</p><div className="mt-2 rounded-xl border border-amber-300/20 bg-amber-400/5 p-3"><div className="flex items-center justify-between"><span className="text-xs text-slate-300">Глава I · Пробуждение Моркварда</span><span className="text-[10px] font-bold text-amber-200">3 / 12 записей</span></div><Progress value={25} className="mt-2 h-1.5 bg-white/10" /><p className="mt-2 text-[10px] text-slate-400">Твои решения сохраняются в истории героя и откроют финал сезона.</p></div><p className="mt-4 text-xs font-semibold text-slate-300">Артефакты в коллекции</p><div className="mt-2 grid gap-2 sm:grid-cols-3">{artifacts.map((artifact) => <div key={artifact.name} className="rounded-xl border border-fuchsia-300/15 bg-fuchsia-400/5 p-3"><span className="text-xl">{artifact.icon}</span><p className="mt-2 text-xs font-bold text-fuchsia-100">{artifact.name}</p><p className="mt-1 text-[10px] text-amber-200">{artifact.rarity}</p><p className="mt-1 text-[10px] text-slate-400">{artifact.effect}</p></div>)}</div><p className="mt-4 text-xs font-semibold text-slate-300">Выбери класс для следующей экспедиции</p><div className="mt-2 grid gap-2">{classes.map((item) => <button type="button" key={item.name} onClick={() => setSelectedClass(item.name)} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${selectedClass === item.name ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-black/20"}`}><span className="text-xl">{item.icon}</span><span className="flex-1"><span className={`block text-sm font-bold ${item.color}`}>{item.name}</span><span className="text-[11px] text-slate-400">{item.note}</span></span>{selectedClass === item.name && <Badge className="bg-cyan-500/20 text-cyan-200">Выбран</Badge>}</button>)}</div></Card>}

    {mode === "event" && <Card className="border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-950/60 to-indigo-950/60 p-4 text-white"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fuchsia-300"><Flame className="size-4" /> Глобальное событие</div><h3 className="mt-1 text-lg font-black">Осада Кристального рифта</h3><p className="mt-1 text-xs text-slate-300">До конца фазы 18 часов. Каждый игрок может изменить исход битвы.</p></div><Badge className="bg-amber-400/15 text-amber-200">x2 награды</Badge></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-black/20 p-3"><Target className="mx-auto size-4 text-red-300" /><p className="mt-1 text-sm font-bold">68%</p><p className="text-[10px] text-slate-400">атака</p></div><div className="rounded-xl bg-black/20 p-3"><Heart className="mx-auto size-4 text-pink-300" /><p className="mt-1 text-sm font-bold">42%</p><p className="text-[10px] text-slate-400">мораль</p></div><div className="rounded-xl bg-black/20 p-3"><Users className="mx-auto size-4 text-cyan-300" /><p className="mt-1 text-sm font-bold">1.2K</p><p className="text-[10px] text-slate-400">участников</p></div></div><Button onClick={() => runAction("Ты присоединился к осаде и получил боевой квест")} className="mt-4 w-full bg-fuchsia-600 hover:bg-fuchsia-500"><ScrollText className="mr-2 size-4" /> Участвовать в осаде</Button></Card>}

    <Card className="border-purple-400/20 bg-purple-950/30 p-4 text-white"><div className="flex items-center gap-2"><Users className="size-5 text-cyan-300" /><h3 className="font-bold">Командная битва</h3></div><p className="mt-2 text-xs text-slate-300">Каждый клик, рейд и экспедиция меняет карту. Бесплатные игроки получают тот же вес вклада, что и донатеры.</p></Card>
  </div>
}

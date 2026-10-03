"use client"

import { useState } from "react"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Check, Copy, ExternalLink } from "lucide-react"

const RECEIVING_WALLET = "UQCloGCBkvvKEpXyHU1YJyGWxETygaThEgMVt1ot9HLfw64P"

const CRYPTO_PACKS = [
  { gt: 100, ton: "0.20", usdt: "0.80" },
  { gt: 500, ton: "0.90", usdt: "3.60" },
  { gt: 1000, ton: "1.70", usdt: "6.80" },
]

function toNano(ton: string) {
  return Math.round(Number(ton) * 1_000_000_000).toString()
}

export default function CryptoPaymentPanel() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const [selected, setSelected] = useState(CRYPTO_PACKS[0])
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const connect = () => tonConnectUI.openModal()
  const sendTon = async () => {
    if (!wallet) return connect()
    setSent(false)
    await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [{ address: RECEIVING_WALLET, amount: toNano(selected.ton) }],
    })
    setSent(true)
  }
  const copyAddress = async () => {
    await navigator.clipboard.writeText(RECEIVING_WALLET)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Card className="bg-black/20 border-cyan-500/30 p-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-white">Оплата криптовалютой</p>
        <Badge className="bg-cyan-600">−5% в TON/USDT</Badge>
      </div>
      <p className="text-xs text-gray-400 mb-3">TON Connect. Оплата отправляется напрямую на официальный кошелёк проекта.</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {CRYPTO_PACKS.map((pack) => (
          <button key={pack.gt} type="button" onClick={() => setSelected(pack)} className={`rounded-lg border p-2 text-center transition ${selected.gt === pack.gt ? "border-cyan-400 bg-cyan-400/15" : "border-white/10 bg-white/5"}`}>
            <span className="block text-xs font-semibold text-white">{pack.gt} GT</span>
            <span className="block text-[10px] text-cyan-300">{pack.ton} TON</span>
            <span className="block text-[10px] text-gray-400">{pack.usdt} USDT</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={wallet ? sendTon : connect} className="flex-1 bg-cyan-600 hover:bg-cyan-500">
          {wallet ? <><Wallet data-icon="inline-start" /> Оплатить {selected.ton} TON</> : <><Wallet data-icon="inline-start" /> Подключить кошелёк</>}
        </Button>
        <Button variant="outline" size="icon" onClick={copyAddress} aria-label="Скопировать TON адрес">
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      {sent && <p className="mt-2 text-xs text-green-300">Транзакция отправлена. Начисление GT произойдёт после проверки сети.</p>}
      <p className="mt-2 text-[10px] text-gray-500 break-all">{RECEIVING_WALLET}</p>
      <a className="mt-1 inline-flex items-center gap-1 text-[10px] text-cyan-300" href={`https://tonviewer.com/${RECEIVING_WALLET}`} target="_blank" rel="noreferrer">Открыть в Tonviewer <ExternalLink /></a>
    </Card>
  )
}

export { RECEIVING_WALLET }

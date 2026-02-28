"use client"
import React, { useState } from 'react'

type Props = {
  userId: string
  adUrl?: string
  reward?: number
  openInModal?: boolean
}

export default function WatchAd({ userId, adUrl, reward = 1, openInModal = true }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [iframeVisible, setIframeVisible] = useState(false)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)

  // poll helper
  const pollStatus = async (sessionId: string) => {
    try {
      const sres = await fetch(`/api/ads/status?sessionId=${encodeURIComponent(sessionId)}`)
      const sdata = await sres.json()
      if (sdata.status === 'confirmed') {
        setStatus('confirmed')
        setLoading(false)
        setIframeVisible(false)
        return true
      }
      if (sdata.status === 'failed') {
        setStatus('failed')
        setLoading(false)
        setIframeVisible(false)
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  const start = async () => {
    setLoading(true)
    setStatus('creating')
    try {
      const res = await fetch('/api/ads/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, reward }),
      })
      const data = await res.json()
      if (!data.sessionId || !data.sig) throw new Error('init failed')

      const targetBase = adUrl || (process.env.NEXT_PUBLIC_AD_URL as string) || ''
      const target = `${targetBase}?session=${encodeURIComponent(data.sessionId)}&sig=${encodeURIComponent(data.sig)}`

      if (openInModal) {
        // open inside app in iframe; listen for postMessage from network if available
        setIframeSrc(target)
        setIframeVisible(true)
        setStatus('opened')

        const onMessage = async (ev: MessageEvent) => {
          // expect message: { type: 'ad_completed', sessionId, sig, proof }
          try {
            const msg = ev.data
            if (!msg || msg.type !== 'ad_completed') return
            if (msg.sessionId !== data.sessionId) return

            // call confirm with networkProof
            await fetch('/api/ads/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: msg.sessionId, sig: data.sig, networkProof: msg.proof }),
            })
            // poll once immediately then continue polling
            await pollStatus(data.sessionId)
          } catch (e) {
            // ignore
          }
        }

        window.addEventListener('message', onMessage)

        // fallback polling if no postMessage arrives
        const fallback = async () => {
          const done = await pollStatus(data.sessionId)
          if (!done) setTimeout(fallback, 2000)
        }
        setTimeout(fallback, 2000)

        // cleanup when iframe closed by user
        const onClose = () => {
          window.removeEventListener('message', onMessage)
        }
        // attach cleanup to window so consumer can call it when closing modal
        ;(window as any).__watchAdCleanup = onClose
      } else {
        window.open(target, '_blank')
        setStatus('opened')

        // start polling
        const poll = async () => {
          const done = await pollStatus(data.sessionId)
          if (!done) setTimeout(poll, 2000)
        }
        setTimeout(poll, 2000)
      }
    } catch (e: any) {
      setStatus('error')
      setLoading(false)
    }
  }

  const closeIframe = () => {
    setIframeVisible(false)
    setIframeSrc(null)
    if ((window as any).__watchAdCleanup) {
      try {
        ;(window as any).__watchAdCleanup()
      } catch (e) {}
      delete (window as any).__watchAdCleanup
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button id="watchAd" onClick={start} disabled={loading}>
          {loading ? 'Ожидайте...' : 'Посмотреть рекламу'}
        </button>
        <button onClick={() => start().catch(() => {})} disabled={loading}>
          Открыть в новой вкладке
        </button>
      </div>
      {status && <div>Статус: {status}</div>}

      {iframeVisible && iframeSrc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ width: '90%', height: '90%', background: '#fff', position: 'relative' }}>
            <button onClick={closeIframe} style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>Закрыть</button>
            <iframe src={iframeSrc} style={{ width: '100%', height: '100%', border: 'none' }} title="ad-frame" />
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type WebAppApi = {
  isAvailable: boolean
  initDataUnsafe?: any
  user?: any
  ready: () => void
  expand: () => void
  close: () => void
  sendData: (payload: any) => void
}

const defaultApi: WebAppApi = {
  isAvailable: false,
  initDataUnsafe: undefined,
  user: undefined,
  ready: () => {},
  expand: () => {},
  close: () => {},
  sendData: () => {},
}

const TelegramContext = createContext<WebAppApi>(defaultApi)

export const useTelegram = () => useContext(TelegramContext)

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<WebAppApi>(defaultApi)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkTelegram = () => {
      console.log("[v0] Checking Telegram WebApp availability")

      if (typeof window === "undefined") {
        console.log("[v0] Window is undefined")
        return
      }

      const WebApp = (window as any).Telegram?.WebApp

      if (!WebApp) {
        console.log("[v0] Telegram.WebApp not found")
        setApi((s) => ({ ...s, isAvailable: false }))
        setIsChecking(false)
        return
      }

      const isInTelegram = !!WebApp
      console.log("[v0] Is in Telegram:", isInTelegram)
      console.log("[v0] InitData:", WebApp.initData)
      console.log("[v0] InitDataUnsafe:", WebApp.initDataUnsafe)

      try {
        WebApp.ready()
        console.log("[v0] Telegram WebApp ready called")
      } catch (e) {
        console.warn("[v0] Error calling WebApp.ready()", e)
      }

      try {
        WebApp.expand()
        console.log("[v0] Telegram WebApp expanded to full screen")
      } catch (e) {
        console.warn("[v0] Error calling WebApp.expand()", e)
      }

      const apiObj: WebAppApi = {
        isAvailable: isInTelegram,
        initDataUnsafe: WebApp.initDataUnsafe || {},
        user: WebApp.initDataUnsafe?.user || { id: Date.now(), first_name: "Player" },
        ready: () => WebApp.ready?.(),
        expand: () => WebApp.expand?.(),
        close: () => WebApp.close?.(),
        sendData: (payload: any) => {
          try {
            const str = typeof payload === "string" ? payload : JSON.stringify(payload)
            WebApp.sendData(str)
          } catch (e) {
            console.warn("[v0] Telegram.WebApp.sendData error", e)
          }
        },
      }

      setApi(apiObj)
      setIsChecking(false)
      console.log("[v0] Telegram WebApp initialized", {
        isAvailable: apiObj.isAvailable,
        user: apiObj.user,
      })
    }

    const timeout = setTimeout(checkTelegram, 500)
    const fallbackTimeout = setTimeout(() => {
      console.log("[v0] Fallback: forcing check complete")
      setIsChecking(false)
    }, 3000)

    return () => {
      clearTimeout(timeout)
      clearTimeout(fallbackTimeout)
    }
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-green-900 to-orange-900">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return <TelegramContext.Provider value={api}>{children}</TelegramContext.Provider>
}

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
      if (typeof window === "undefined") return

      const WebApp = (window as any).Telegram?.WebApp

      // Check if opened inside Telegram
      if (!WebApp || !WebApp.initData) {
        console.log("[v0] Not opened in Telegram WebApp")
        setApi((s) => ({ ...s, isAvailable: false }))
        setIsChecking(false)
        return
      }

      // Initialize Telegram WebApp
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
        isAvailable: true,
        initDataUnsafe: WebApp.initDataUnsafe,
        user: WebApp.initDataUnsafe?.user,
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
      console.log("[v0] Telegram WebApp initialized", { user: apiObj.user })
    }

    // Wait a bit for Telegram SDK to load
    const timeout = setTimeout(checkTelegram, 100)
    return () => clearTimeout(timeout)
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

  if (!api.isAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-green-900 to-orange-900 p-4">
        <div className="max-w-md w-full bg-black/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-green-500/30">
          <div className="text-6xl mb-6">🐹</div>
          <h1 className="text-3xl font-bold text-white mb-4">Guinea Pig Clicker</h1>
          <p className="text-gray-300 mb-6">This game can only be opened through the Telegram bot.</p>
          <p className="text-gray-400 mb-8 text-sm">
            Please open the game from the official bot in Telegram to start playing.
          </p>
          <a
            href="https://t.me/GuineaPigClicker_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-8 rounded-full hover:from-green-600 hover:to-blue-600 transition-all"
          >
            Open in Telegram
          </a>
        </div>
      </div>
    )
  }

  return <TelegramContext.Provider value={api}>{children}</TelegramContext.Provider>
}

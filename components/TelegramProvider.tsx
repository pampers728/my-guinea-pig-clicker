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

  useEffect(() => {
    // safe client check
    if (typeof window === "undefined") return

    const has = !!(window as any).Telegram && !!(window as any).Telegram.WebApp
    if (!has) {
      console.log("[v0] Telegram WebApp not available - running in regular browser")
      setApi((s) => ({ ...s, isAvailable: false }))
      return
    }

    const WebApp = (window as any).Telegram.WebApp

    // call ready and expand only if available
    try {
      WebApp.ready?.()
      console.log("[v0] Telegram WebApp ready called")
    } catch (e) {
      console.warn("[v0] Error calling WebApp.ready()", e)
    }

    try {
      WebApp.expand?.()
      console.log("[v0] Telegram WebApp expand called")
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
          console.log("[v0] Sending data to Telegram bot:", payload)
          WebApp.sendData(str)
        } catch (e) {
          console.warn("[v0] Telegram.WebApp.sendData error", e)
        }
      },
    }

    setApi(apiObj)
    console.log("[v0] Telegram WebApp API initialized", { user: apiObj.user })

    // listen for theme change if needed
    try {
      WebApp.onEvent?.("themeChanged", () => {
        console.log("[v0] Theme changed in Telegram")
      })
    } catch (e) {}
  }, [])

  return <TelegramContext.Provider value={api}>{children}</TelegramContext.Provider>
}

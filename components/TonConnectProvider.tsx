"use client"

import type { ReactNode } from "react"
import { TonConnectUIProvider } from "@tonconnect/ui-react"

export default function TonConnectProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  )
}

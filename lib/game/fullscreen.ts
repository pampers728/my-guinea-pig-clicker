export type FullscreenResult = { requested: boolean; active: boolean; mode: "telegram-fullscreen" | "browser-fullscreen" | "expanded" | "windowed" }

export async function requestGameFullscreen(telegram: { isAvailable: boolean; requestFullscreen?: () => Promise<boolean>; expand: () => void }): Promise<FullscreenResult> {
  if (telegram.isAvailable && telegram.requestFullscreen) {
    const active = await telegram.requestFullscreen()
    if (active) return { requested: true, active: true, mode: "telegram-fullscreen" }
  }

  const element = document.documentElement
  if (element.requestFullscreen) {
    try {
      await element.requestFullscreen()
      return { requested: true, active: document.fullscreenElement === element, mode: "browser-fullscreen" }
    } catch {
      // Browser fullscreen may be blocked by the host or iframe policy.
    }
  }

  if (telegram.isAvailable) {
    try { telegram.expand() } catch { /* Host may not expose expansion. */ }
    return { requested: false, active: false, mode: "expanded" }
  }

  return { requested: false, active: false, mode: "windowed" }
}

export async function exitGameFullscreen(telegram: { isAvailable: boolean; exitFullscreen?: () => Promise<boolean> }) {
  if (telegram.isAvailable && telegram.exitFullscreen) {
    const exited = await telegram.exitFullscreen()
    if (exited) return
  }
  if (document.fullscreenElement && document.exitFullscreen) {
    try { await document.exitFullscreen() } catch { /* Host owns fullscreen lifecycle. */ }
  }
}

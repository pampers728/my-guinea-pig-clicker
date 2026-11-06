import { NextRequest, NextResponse } from "next/server"
import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key",
)

type MmoProgress = { inventory: string[]; chestOpen: boolean }

function authenticate(initData: string) {
  const params = new URLSearchParams(initData)
  const receivedHash = params.get("hash")
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!receivedHash || !botToken) return null
  params.delete("hash")
  const dataCheckString = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("\n")
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest()
  const expected = createHmac("sha256", secret).update(dataCheckString).digest("hex")
  const valid = receivedHash.length === expected.length && timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expected))
  if (!valid) return null
  try {
    const user = JSON.parse(params.get("user") || "null") as { id?: number } | null
    return user?.id ? String(user.id) : null
  } catch { return null }
}

function responseError(message: string, status: number) { return NextResponse.json({ ok: false, error: message }, { status }) }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { initData?: string; action?: "load" | "save" | "open_chest"; progress?: Partial<MmoProgress> }
    const userId = authenticate(body.initData || "")
    if (!userId) return responseError("Telegram authentication required", 401)

    const { data: player, error: readError } = await supabaseAdmin.from("players").select("task_progress").eq("user_id", userId).maybeSingle()
    if (readError) return responseError("Progress unavailable", 503)
    const taskProgress = (player?.task_progress && typeof player.task_progress === "object" ? player.task_progress : {}) as Record<string, unknown>
    const current = (taskProgress.mmo as Partial<MmoProgress> | undefined) || { inventory: [], chestOpen: false }
    const currentProgress: MmoProgress = { inventory: Array.isArray(current.inventory) ? current.inventory.filter((item): item is string => typeof item === "string").slice(0, 100) : [], chestOpen: current.chestOpen === true }

    if (body.action === "load") return NextResponse.json({ ok: true, progress: currentProgress })
  if (body.action === "open_chest") {
    const { data, error } = await supabaseAdmin.rpc("claim_mmo_chest", { p_user_id: userId })
    if (error || !data?.progress) return responseError("Progress unavailable", 503)
    const progress = data.progress as MmoProgress
    return NextResponse.json({ ok: true, progress, claimed: data.claimed === true, alreadyClaimed: data.alreadyClaimed === true })
  }
    if (body.action === "save") {
      const next: MmoProgress = { inventory: currentProgress.inventory, chestOpen: currentProgress.chestOpen }
      const { error } = await supabaseAdmin.from("players").update({ task_progress: { ...taskProgress, mmo: next }, updated_at: new Date().toISOString() }).eq("user_id", userId)
      if (error) return responseError("Progress unavailable", 503)
      return NextResponse.json({ ok: true, progress: next })
    }
    return responseError("Unknown action", 400)
  } catch { return responseError("Invalid request", 400) }
}

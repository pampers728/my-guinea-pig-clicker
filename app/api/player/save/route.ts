import { type NextRequest, NextResponse } from "next/server"
import { calculateXPNeeded } from "@/lib/pigs"

// Supabase not accessible from v0 runtime
// Game uses localStorage for persistence
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { userId, xp: currentXP } = data

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    let level = 1
    let xp = currentXP || 0

    // Level up logic
    while (xp >= calculateXPNeeded(level)) {
      xp -= calculateXPNeeded(level)
      level += 1
    }

    // Just return ok - client handles actual storage via localStorage
    return NextResponse.json({ ok: true, level })
  } catch (error) {
    console.error("[v0] Error in save route:", error)
    return NextResponse.json({ ok: true, level: 1 })
  }
}

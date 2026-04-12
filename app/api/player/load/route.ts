import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateOfflineIncome } from "@/lib/pigs"

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, username } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // Try to load from Supabase
    const { data: existingPlayer, error: fetchError } = await supabaseAdmin
      .from("players")
      .select("*, miners(*)")
      .eq("user_id", String(userId))
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[v0] Supabase fetch error:", fetchError)
      // Graceful fallback for v0 preview
      return NextResponse.json({ ok: true, offlineIncome: 0 })
    }

    if (existingPlayer) {
      // Calculate offline income
      const lastSeen = new Date(existingPlayer.last_online || existingPlayer.created_at)
      const offlineIncome = calculateOfflineIncome(existingPlayer.miners || [], lastSeen)

      if (offlineIncome > 0) {
        await supabaseAdmin
          .from("players")
          .update({
            guinea_tokens: (existingPlayer.guinea_tokens || 0) + Math.floor(offlineIncome),
            last_online: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", String(userId))

        existingPlayer.guinea_tokens = (existingPlayer.guinea_tokens || 0) + Math.floor(offlineIncome)
      }

      return NextResponse.json({ ...existingPlayer, offlineIncome })
    }

    // Create new player
    const { data: newPlayer, error: createError } = await supabaseAdmin
      .from("players")
      .insert({
        user_id: String(userId),
        username: username || "Player",
        score: 0,
        xp: 0,
        level: 1,
        carrots: 0,
        guinea_tokens: 0,
        telegram_stars: 0,
        total_clicks: 0,
        active_pig_id: "white_basic",
        pigs: [{ id: "white_basic", rarity: "COMMON" }],
        referral_bonus: 0,
        referrals_count: 0,
        carrots_per_click_level: 1,
        max_energy_level: 1,
        current_energy: 1000,
        task_progress: {},
        terms_accepted: false,
        last_online: new Date().toISOString(),
      })
      .select("*, miners(*)")
      .single()

    if (createError) {
      console.error("[v0] Supabase create error:", createError)
      return NextResponse.json({ ok: true, offlineIncome: 0 })
    }

    return NextResponse.json({ ...newPlayer, offlineIncome: 0 })
  } catch (error) {
    console.error("[v0] Error in load route:", error)
    // Graceful fallback - let client use localStorage
    return NextResponse.json({ ok: true, offlineIncome: 0 })
  }
}

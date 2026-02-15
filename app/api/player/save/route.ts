import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { calculateXPNeeded } from "@/lib/pigs"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const {
      userId,
      carrots,
      guineaTokens,
      telegramStars,
      totalClicks,
      xp: currentXP,
      activePigId,
      pigs,
      carrotsPerClickLevel,
      maxEnergyLevel,
      acceptedTerms,
    } = data

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

    const { error } = await supabase
      .from("players")
      .update({
        score: carrots || 0,
        xp,
        level,
        carrots: carrots || 0,
        guinea_tokens: guineaTokens || 0,
        telegram_stars: telegramStars || 0,
        total_clicks: totalClicks || 0,
        active_pig_id: activePigId || "white_basic",
        pigs: pigs || [],
        carrots_per_click_level: carrotsPerClickLevel || 1,
        max_energy_level: maxEnergyLevel || 1,
        accepted_terms: acceptedTerms || false,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Error saving player:", error)
      throw error
    }

    return NextResponse.json({ ok: true, level })
  } catch (error) {
    console.error("[v0] Error saving player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

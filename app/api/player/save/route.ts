import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateXPNeeded } from "@/lib/pigs"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      currentEnergy,
      acceptedTerms,
      playerMiners,
    } = data

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    let level = 1
    let xp = currentXP || 0

    while (xp >= calculateXPNeeded(level)) {
      xp -= calculateXPNeeded(level)
      level += 1
    }

    // Save to Supabase
    const { error } = await supabaseAdmin
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
        current_energy: currentEnergy || 1000,
        terms_accepted: acceptedTerms || false,
        last_online: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", String(userId))

    if (error) {
      console.error("[v0] Supabase save error:", error)
      // Graceful fallback
      return NextResponse.json({ ok: true, level })
    }

    // Save miners if provided
    if (playerMiners && playerMiners.length > 0) {
      for (const miner of playerMiners) {
        await supabaseAdmin
          .from("miners")
          .upsert({
            user_id: String(userId),
            miner_type: miner.miner_type,
            level: miner.level,
          }, { onConflict: "user_id,miner_type" })
      }
    }

    return NextResponse.json({ ok: true, level })
  } catch (error) {
    console.error("[v0] Error in save route:", error)
    return NextResponse.json({ ok: true, level: 1 })
  }
}

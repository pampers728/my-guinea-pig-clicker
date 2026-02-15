import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { calculateOfflineIncome } from "@/lib/pigs"

export async function POST(req: NextRequest) {
  try {
    const { userId, username } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // Check if player exists
    const { data: existingPlayer, error: fetchError } = await supabase
      .from("players")
      .select("*, miners(*)")
      .eq("user_id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[v0] Error fetching player:", fetchError)
      throw fetchError
    }

    if (existingPlayer) {
      // Calculate offline income
      const lastSeen = new Date(existingPlayer.last_seen)
      const offlineIncome = calculateOfflineIncome(existingPlayer.miners || [], lastSeen)
      
      if (offlineIncome > 0) {
        // Update GT with offline income
        const { error: updateError } = await supabase
          .from("players")
          .update({
            guinea_tokens: (existingPlayer.guinea_tokens || 0) + offlineIncome,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        if (updateError) {
          console.error("[v0] Error updating offline income:", updateError)
        }

        existingPlayer.guinea_tokens = (existingPlayer.guinea_tokens || 0) + offlineIncome
      }

      return NextResponse.json({ ...existingPlayer, offlineIncome })
    }

    // Create new player
    const { data: newPlayer, error: createError } = await supabase
      .from("players")
      .insert({
        user_id: userId,
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
        task_progress: {},
        accepted_terms: false,
        last_seen: new Date().toISOString(),
      })
      .select("*, miners(*)")
      .single()

    if (createError) {
      console.error("[v0] Error creating player:", createError)
      throw createError
    }

    return NextResponse.json({ ...newPlayer, offlineIncome: 0 })
  } catch (error) {
    console.error("[v0] Error loading player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

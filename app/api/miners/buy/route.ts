import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getMinerCost, MINERS } from "@/lib/pigs"

export async function POST(req: NextRequest) {
  try {
    const { userId, minerType } = await req.json()

    if (!userId || !minerType) {
      return NextResponse.json({ error: "userId and minerType required" }, { status: 400 })
    }

    const miner = MINERS.find((m) => m.id === minerType)
    if (!miner) {
      return NextResponse.json({ error: "Invalid miner type" }, { status: 400 })
    }

    // Get player data
    const { data: player, error: fetchError } = await supabase
      .from("players")
      .select("guinea_tokens, miners(*)")
      .eq("user_id", userId)
      .single()

    if (fetchError || !player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Check if player already has this miner type
    const existingMiner = player.miners?.find((m: any) => m.miner_type === minerType)
    const nextLevel = existingMiner ? existingMiner.level + 1 : 1

    if (nextLevel > 5) {
      return NextResponse.json({ error: "Max level reached" }, { status: 400 })
    }

    const cost = getMinerCost(minerType, nextLevel)

    if (player.guinea_tokens < cost) {
      return NextResponse.json({ error: "Insufficient GT" }, { status: 400 })
    }

    // Deduct GT
    const { error: updateError } = await supabase
      .from("players")
      .update({
        guinea_tokens: player.guinea_tokens - cost,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      throw updateError
    }

    if (existingMiner) {
      // Upgrade existing miner
      const { error: upgradeError } = await supabase
        .from("miners")
        .update({ level: nextLevel })
        .eq("id", existingMiner.id)

      if (upgradeError) {
        throw upgradeError
      }
    } else {
      // Buy new miner
      const { error: insertError } = await supabase.from("miners").insert({
        user_id: userId,
        miner_type: minerType,
        level: 1,
      })

      if (insertError) {
        throw insertError
      }
    }

    return NextResponse.json({ ok: true, level: nextLevel, cost })
  } catch (error) {
    console.error("[v0] Error buying miner:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

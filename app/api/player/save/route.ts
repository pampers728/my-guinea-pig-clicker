import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

function calculateXPNeeded(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const {
      userId,
      carrots,
      guineaTokens,
      telegramStars,
      totalClicks,
      miners,
      xp: currentXP,
      activePigId,
      pigs,
      carrotsPerClickLevel,
      maxEnergyLevel,
    } = data

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    if (!clientPromise) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const client = await clientPromise
    const db = client.db("game")
    const users = db.collection("players")

    let level = 1
    let xp = currentXP || 0

    // Level up logic
    while (xp >= calculateXPNeeded(level)) {
      xp -= calculateXPNeeded(level)
      level += 1
    }

    const updateData = {
      score: carrots || 0,
      xp,
      level,
      carrots: carrots || 0,
      guineaTokens: guineaTokens || 0,
      telegramStars: telegramStars || 0,
      totalClicks: totalClicks || 0,
      miners: miners || [],
      activePigId: activePigId || "white_basic",
      pigs: pigs || [],
      carrotsPerClickLevel: carrotsPerClickLevel || 1,
      maxEnergyLevel: maxEnergyLevel || 1,
      updatedAt: new Date(),
    }

    await users.updateOne(
      { userId },
      {
        $set: updateData,
      },
      { upsert: true },
    )

    return NextResponse.json({ ok: true, level })
  } catch (error) {
    console.error("[v0] Error saving player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

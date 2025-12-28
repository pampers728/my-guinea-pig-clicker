import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const { userId, username } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    if (!clientPromise) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const client = await clientPromise
    const db = client.db("game")
    const users = db.collection("players")

    const result = await users.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          score: 0,
          xp: 0,
          level: 1,
          carrots: 0,
          guineaTokens: 0,
          telegramStars: 0,
          totalClicks: 0,
          activePigId: "default",
          pigs: [
            {
              id: "default",
              name: "Default Pig",
              rarity: "COMMON",
              obtainedAt: new Date(),
              source: "starter",
              icon: "🐹",
              description: "Your first guinea pig",
            },
          ],
          referralBonus: 0,
          referralsCount: 0,
          miners: [],
          taskProgress: {},
          createdAt: new Date(),
        },
        $set: {
          username: username || "Player",
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error loading player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

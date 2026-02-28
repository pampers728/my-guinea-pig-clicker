import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const { userId, referrerId } = await req.json()

    if (!userId || !referrerId) {
      return NextResponse.json({ error: "userId and referrerId required" }, { status: 400 })
    }

    if (!clientPromise) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const client = await clientPromise
    const db = client.db("game")
    const users = db.collection("players")

    const existingUser = await users.findOne({ userId })
    if (existingUser && existingUser.referrerId) {
      return NextResponse.json({ error: "User already has a referrer" }, { status: 400 })
    }

    await users.updateOne(
      { userId },
      {
        $set: {
          referrerId,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    const referrer = await users.findOne({ userId: referrerId })
    if (referrer) {
      const newCount = (referrer.referralsCount || 0) + 1
      let bonus = 5 // Base 5% for first referral

      if (newCount >= 100) bonus = 10
      if (newCount >= 500) bonus = 15

      await users.updateOne(
        { userId: referrerId },
        {
          $set: {
            referralsCount: newCount,
            referralBonus: Math.min(bonus, 15), // Max 15%
          },
        },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Error registering referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

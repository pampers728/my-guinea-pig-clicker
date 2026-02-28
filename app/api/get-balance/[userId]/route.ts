import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    if (!process.env.MONGODB_URI) {
      console.log("[v0] MongoDB not configured, returning mock balance")
      return NextResponse.json({
        userId,
        guineaTokens: 0,
        stars: 0,
        clicks: 0,
      })
    }

    const client = await clientPromise
    if (!client) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const db = client.db("guinea_pig_clicker")
    const users = db.collection("users")

    let user = await users.findOne({ telegramId: userId })

    if (!user) {
      user = {
        telegramId: userId,
        guineaTokens: 0,
        stars: 0,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await users.insertOne(user)
    }

    return NextResponse.json({
      userId: user.telegramId,
      guineaTokens: user.guineaTokens || 0,
      stars: user.stars || 0,
      clicks: user.clicks || 0,
    })
  } catch (error) {
    console.error("[v0] Get balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

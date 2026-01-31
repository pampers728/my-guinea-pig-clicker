import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ period: string }> }) {
  try {
    const { period } = await params

    if (!["daily", "weekly", "alltime"].includes(period)) {
      return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 })
    }

    if (!clientPromise) {
      console.log("[v0] MongoDB not configured, returning empty leaderboard")
      return NextResponse.json(
        {
          success: true,
          data: [],
        },
        { status: 200 },
      )
    }

    const client = await clientPromise
    const db = client.db("game")
    const users = db.collection("players")

    let query = {}

    if (period === "daily") {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      query = { updatedAt: { $gte: oneDayAgo } }
    } else if (period === "weekly") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      query = { updatedAt: { $gte: oneWeekAgo } }
    }

    const leaderboard = await users
      .find(query)
      .sort({ score: -1 })
      .limit(100)
      .project({ userId: 1, username: 1, score: 1, level: 1 })
      .toArray()

    const formattedData = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username || `Player ${user.userId}`,
      score: user.score || 0,
      level: user.level || 1,
      avatar: "🐹",
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
    })
  } catch (error) {
    console.error("[v0] Leaderboard error:", error)
    // Return empty leaderboard on error instead of failing
    return NextResponse.json({ success: true, data: [] }, { status: 200 })
  }
}

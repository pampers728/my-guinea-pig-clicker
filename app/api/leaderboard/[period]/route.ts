import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { period: string } }) {
  try {
    if (!clientPromise) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const { period } = params

    if (!["daily", "weekly", "alltime"].includes(period)) {
      return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("guineapig")
    const collection = db.collection("users")

    let timeFilter = {}
    const now = new Date()

    if (period === "daily") {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      timeFilter = { lastUpdated: { $gte: yesterday } }
    } else if (period === "weekly") {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      timeFilter = { lastUpdated: { $gte: lastWeek } }
    }

    const topPlayers = await collection
      .find(timeFilter)
      .project({
        _id: 0,
        username: 1,
        carrots: 1,
        guineaTokens: 1,
        totalClicks: 1,
        level: 1,
      })
      .toArray()

    const playersWithScore = topPlayers
      .map((player) => ({
        username: player.username,
        score: (player.carrots || 0) + (player.guineaTokens || 0) * 250000,
        carrots: player.carrots || 0,
        gt: player.guineaTokens || 0,
        clicks: player.totalClicks || 0,
        level: player.level || 1,
        avatar: "🐹",
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map((player, index) => ({
        rank: index + 1,
        ...player,
      }))

    return NextResponse.json({
      success: true,
      period,
      data: playersWithScore,
      timestamp: new Date().toISOString(),
      count: playersWithScore.length,
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

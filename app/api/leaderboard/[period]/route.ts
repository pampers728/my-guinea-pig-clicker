import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest, { params }: { params: Promise<{ period: string }> }) {
  try {
    const { period } = await params

    if (!["daily", "weekly", "alltime"].includes(period)) {
      return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 })
    }

    let query = supabaseAdmin
      .from("players")
      .select("user_id, username, score, level, updated_at")
      .order("score", { ascending: false })
      .limit(100)

    if (period === "daily") {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      query = query.gte("updated_at", oneDayAgo.toISOString())
    } else if (period === "weekly") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      query = query.gte("updated_at", oneWeekAgo.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Leaderboard Supabase error:", error)
      return NextResponse.json({ success: true, data: [] }, { status: 200 })
    }

    const formattedData = (data || []).map((user, index) => ({
      rank: index + 1,
      username: user.username || `Player`,
      score: user.score || 0,
      level: user.level || 1,
      avatar: "🐹",
    }))

    return NextResponse.json({ success: true, data: formattedData })
  } catch (error) {
    console.error("[v0] Leaderboard error:", error)
    return NextResponse.json({ success: true, data: [] }, { status: 200 })
  }
}

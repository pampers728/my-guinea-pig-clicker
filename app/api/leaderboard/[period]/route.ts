import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function makeAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period: string }> },
) {
  const { period } = await params

  if (!["daily", "weekly", "alltime"].includes(period)) {
    return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 })
  }

  const supabaseAdmin = makeAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ success: true, data: [] })
  }

  try {
    // Use last_online column (actual column name in players table)
    let query = supabaseAdmin
      .from("players")
      .select("user_id, username, carrots, level, last_online")
      .order("carrots", { ascending: false })
      .limit(50)

    if (period === "daily") {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      query = query.gte("last_online", cutoff)
    } else if (period === "weekly") {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte("last_online", cutoff)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Leaderboard error:", error.message)
      return NextResponse.json({ success: true, data: [] })
    }

    const formattedData = (data ?? []).map((user, index) => ({
      rank: index + 1,
      username: user.username || "Player",
      score: user.carrots || 0,
      level: user.level || 1,
    }))

    return NextResponse.json({ success: true, data: formattedData })
  } catch (err) {
    console.error("[v0] Leaderboard exception:", err)
    return NextResponse.json({ success: true, data: [] })
  }
}

// Save current player score so they appear in leaderboard
export async function POST(request: NextRequest) {
  try {
    const { userId, username, carrots, level } = await request.json()
    if (!userId) return NextResponse.json({ ok: false })

    const supabaseAdmin = makeAdmin()
    if (!supabaseAdmin) return NextResponse.json({ ok: true })

    await supabaseAdmin
      .from("players")
      .upsert(
        {
          user_id: String(userId),
          username: username || "Player",
          carrots: carrots || 0,
          level: level || 1,
          last_online: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Leaderboard save error:", err)
    return NextResponse.json({ ok: true })
  }
}

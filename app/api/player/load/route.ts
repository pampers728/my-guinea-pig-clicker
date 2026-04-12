import { type NextRequest, NextResponse } from "next/server"

// Supabase is not accessible from v0 runtime, return empty response
// Game uses localStorage instead
export async function POST(req: NextRequest) {
  try {
    const { userId, username } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // Return empty/default response - client will use localStorage
    return NextResponse.json({
      ok: true,
      offlineIncome: 0,
    })
  } catch (error) {
    console.error("[v0] Error in load route:", error)
    // Don't fail - let client use localStorage
    return NextResponse.json({ ok: true, offlineIncome: 0 })
  }
}

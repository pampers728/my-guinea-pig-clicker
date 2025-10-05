import { type NextRequest, NextResponse } from "next/server"
import { getUserBalance } from "@/lib/telegram-bot"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const telegramId = searchParams.get("telegramId")

    if (!telegramId) {
      return NextResponse.json({ error: "telegramId is required" }, { status: 400 })
    }

    const balance = await getUserBalance(Number.parseInt(telegramId))

    return NextResponse.json(balance)
  } catch (error) {
    console.error("[v0] Balance API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

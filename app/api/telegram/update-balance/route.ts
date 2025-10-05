import { type NextRequest, NextResponse } from "next/server"
import { updateUserBalance } from "@/lib/telegram-bot"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, stars, carrots, balanceGT } = body

    if (!telegramId) {
      return NextResponse.json({ error: "telegramId is required" }, { status: 400 })
    }

    const updates: any = {}
    if (stars !== undefined) updates.stars = stars
    if (carrots !== undefined) updates.carrots = carrots
    if (balanceGT !== undefined) updates.balanceGT = balanceGT

    const balance = await updateUserBalance(Number.parseInt(telegramId), updates)

    return NextResponse.json(balance)
  } catch (error) {
    console.error("[v0] Update balance API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

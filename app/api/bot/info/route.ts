import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function GET() {
  try {
    // Get bot info
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)

    const botInfo = await response.json()

    return NextResponse.json(botInfo)
  } catch (error) {
    console.error("[v0] Bot info error:", error)
    return NextResponse.json({ error: "Failed to get bot info" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://my-guinea-pig-clicker.vercel.app/api/webhook"

export async function GET() {
  try {
    // Set webhook
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: WEBHOOK_URL }),
    })

    const webhookResult = await setWebhookResponse.json()

    // Get webhook info
    const getWebhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)

    const webhookInfo = await getWebhookResponse.json()

    return NextResponse.json({
      setup: webhookResult,
      info: webhookInfo,
    })
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}

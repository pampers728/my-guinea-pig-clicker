import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { userId, gtAmount } = await request.json()

    if (!userId || !gtAmount) {
      return NextResponse.json({ error: "Missing userId or gtAmount" }, { status: 400 })
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    const starsAmount = gtAmount * 2 // 1 GT = 2 Stars conversion rate

    console.log("[v0] Initiating Stars purchase:", { userId, gtAmount, starsAmount })

    const invoiceData = {
      chat_id: userId,
      title: `${gtAmount} Guinea Tokens`,
      description: `Покупка ${gtAmount} GT для Guinea Pig Clicker`,
      payload: JSON.stringify({ userId, gtAmount, timestamp: Date.now() }),
      currency: "XTR", // Telegram Stars currency code
      prices: [
        {
          label: `${gtAmount} GT`,
          amount: starsAmount * 100000000, // Convert to Stars satoshis (1 Star = 100000000 units)
        },
      ],
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendInvoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error("[v0] Telegram API error:", result)
      return NextResponse.json({ error: result.description || "Failed to send invoice" }, { status: 500 })
    }

    console.log("[v0] Invoice sent successfully")
    return NextResponse.json({ success: true, message: "Invoice sent" })
  } catch (error) {
    console.error("[v0] Buy stars error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

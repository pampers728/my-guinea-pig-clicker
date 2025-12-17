import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const PAYMENT_PROVIDER_TOKEN = process.env.PAYMENT_PROVIDER_TOKEN || "" // For real currencies (UAH, USD, etc.)

// GT packages with prices in different currencies
const GT_PACKAGES = {
  "10": { stars: 20, uah: 50, usd: 2 }, // 10 GT = 20 Stars / 50 UAH / $2
  "50": { stars: 100, uah: 200, usd: 6 }, // 50 GT = 100 Stars / 200 UAH / $6
  "100": { stars: 200, uah: 400, usd: 12 }, // 100 GT = 200 Stars / 400 UAH / $12
  "500": { stars: 1000, uah: 1800, usd: 55 }, // 500 GT = 1000 Stars / 1800 UAH / $55
  "1000": { stars: 2000, uah: 3500, usd: 100 }, // 1000 GT = 2000 Stars / 3500 UAH / $100
}

export async function POST(request: NextRequest) {
  try {
    const { userId, gtAmount, currency = "XTR" } = await request.json()

    if (!userId || !gtAmount) {
      return NextResponse.json({ error: "Missing userId or gtAmount" }, { status: 400 })
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    const packageKey = gtAmount.toString()
    if (!GT_PACKAGES[packageKey as keyof typeof GT_PACKAGES]) {
      return NextResponse.json({ error: "Invalid GT package" }, { status: 400 })
    }

    const packageData = GT_PACKAGES[packageKey as keyof typeof GT_PACKAGES]

    const payload = JSON.stringify({
      userId,
      gtAmount,
      timestamp: Date.now(),
      txId: `${userId}_${Date.now()}`, // unique transaction ID
    })

    console.log("[v0] Initiating purchase:", { userId, gtAmount, currency })

    let invoiceData: any

    if (currency === "XTR") {
      // Telegram Stars - amount is the number of Stars (integer)
      const starsAmount = packageData.stars

      // Validate minimum amount
      if (starsAmount < 1) {
        return NextResponse.json({ error: "Amount must be at least 1 Star" }, { status: 400 })
      }

      invoiceData = {
        chat_id: userId,
        title: `${gtAmount} Guinea Tokens`,
        description: `Покупка ${gtAmount} GT для Guinea Pig Clicker`,
        payload,
        currency: "XTR",
        prices: [
          {
            label: `${gtAmount} GT`,
            amount: starsAmount, // Stars are already integers
          },
        ],
      }
    } else if (currency === "UAH") {
      // Ukrainian Hryvnia - convert to kopiykas (1 UAH = 100 kopiykas)
      const kopiykas = Math.round(packageData.uah * 100)

      // Validate minimum amount (1 kopiyка)
      if (kopiykas < 1) {
        return NextResponse.json({ error: "Amount must be at least 1 kopiyка" }, { status: 400 })
      }

      invoiceData = {
        chat_id: userId,
        title: `${gtAmount} Guinea Tokens`,
        description: `Покупка ${gtAmount} GT для Guinea Pig Clicker`,
        payload,
        provider_token: PAYMENT_PROVIDER_TOKEN,
        currency: "UAH",
        prices: [
          {
            label: `${gtAmount} GT`,
            amount: kopiykas, // Integer in kopiykas
          },
        ],
      }
    } else if (currency === "USD") {
      // US Dollars - convert to cents (1 USD = 100 cents)
      const cents = Math.round(packageData.usd * 100)

      // Validate minimum amount (1 cent)
      if (cents < 1) {
        return NextResponse.json({ error: "Amount must be at least 1 cent" }, { status: 400 })
      }

      invoiceData = {
        chat_id: userId,
        title: `${gtAmount} Guinea Tokens`,
        description: `Покупка ${gtAmount} GT для Guinea Pig Clicker`,
        payload,
        provider_token: PAYMENT_PROVIDER_TOKEN,
        currency: "USD",
        prices: [
          {
            label: `${gtAmount} GT`,
            amount: cents, // Integer in cents
          },
        ],
      }
    } else {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    const finalAmount = invoiceData.prices[0].amount
    if (!Number.isInteger(finalAmount) || finalAmount < 1) {
      return NextResponse.json({ error: "Invalid amount format" }, { status: 400 })
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

    console.log("[v0] Invoice sent successfully:", { currency, amount: invoiceData.prices[0].amount })
    return NextResponse.json({ success: true, message: "Invoice sent" })
  } catch (error) {
    console.error("[v0] Buy stars error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

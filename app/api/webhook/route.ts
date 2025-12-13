import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    console.log("[v0] Telegram webhook received:", JSON.stringify(update, null, 2))

    // Handle web_app_data (when user sends data from Mini App)
    if (update.message?.web_app_data) {
      const webAppData = JSON.parse(update.message.web_app_data.data)
      const chatId = update.message.chat.id

      console.log("[v0] Web App Data:", webAppData)

      // Handle different actions
      if (webAppData.action === "buy") {
        // Send invoice for Stars payment
        await sendInvoice(chatId, webAppData.itemId, webAppData.amount)
      } else if (webAppData.action === "referral_bonus") {
        // Handle referral bonus
        await sendMessage(chatId, `Вы получили ${webAppData.bonus} GT за приглашение друга!`)
      }
    }

    // Handle pre_checkout_query (confirm payment)
    if (update.pre_checkout_query) {
      await answerPreCheckoutQuery(update.pre_checkout_query.id, true)
    }

    // Handle successful_payment (payment completed)
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment
      const chatId = update.message.chat.id

      console.log("[v0] Payment successful:", payment)

      // Parse payload to get item info
      const payload = JSON.parse(payment.invoice_payload)

      // Here you would credit the user's account in your database
      // For now, send confirmation message
      await sendMessage(chatId, `Покупка успешна! Вы получили ${payload.gtAmount} GT`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

async function sendInvoice(chatId: number, itemId: number, gtAmount: number) {
  const starsAmount = gtAmount * 2 // 1 GT = 2 Stars

  const invoiceData = {
    chat_id: chatId,
    title: `Покупка ${gtAmount} GT`,
    description: `Вы покупаете ${gtAmount} внутриигровой валюты (GT)`,
    payload: JSON.stringify({ itemId, gtAmount }),
    currency: "XTR", // Telegram Stars
    prices: [
      {
        label: `${gtAmount} GT`,
        amount: starsAmount * 100000000, // Convert to Stars satoshis (1 Star = 100000000)
      },
    ],
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendInvoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoiceData),
  })

  return response.json()
}

async function answerPreCheckoutQuery(queryId: string, ok: boolean) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pre_checkout_query_id: queryId, ok }),
  })

  return response.json()
}

async function sendMessage(chatId: number, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  return response.json()
}

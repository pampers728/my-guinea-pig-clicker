import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    console.log("[v0] Telegram webhook received:", JSON.stringify(update, null, 2))

    if (update.pre_checkout_query) {
      console.log("[v0] Pre-checkout query received")
      await answerPreCheckoutQuery(update.pre_checkout_query.id, true)
      return NextResponse.json({ ok: true })
    }

    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment
      const chatId = update.message.chat.id
      const userId = update.message.from.id

      console.log("[v0] Payment successful:", payment)

      // Parse payload to get purchase info
      const payload = JSON.parse(payment.invoice_payload)
      const { gtAmount, txId } = payload

      if (process.env.MONGODB_URI) {
        const client = await clientPromise
        if (client) {
          const db = client.db("guinea_pig_clicker")
          const users = db.collection("users")
          const pendingInvoices = db.collection("pending_invoices")

          if (txId) {
            await pendingInvoices.deleteOne({ txId })
            console.log("[v0] Pending invoice removed:", txId)
          }

          await users.updateOne(
            { telegramId: userId.toString() },
            {
              $inc: { guineaTokens: gtAmount },
              $set: { updatedAt: new Date() },
            },
            { upsert: true },
          )

          console.log("[v0] User balance updated:", { userId, gtAmount })
        }
      }

      // Send confirmation message
      await sendMessage(
        chatId,
        `✅ Покупка успешна!\nВы получили ${gtAmount} GT\n\nОткройте игру чтобы увидеть обновленный баланс.`,
      )

      return NextResponse.json({ ok: true })
    }

    if (update.message?.web_app_data) {
      const webAppData = JSON.parse(update.message.web_app_data.data)
      const chatId = update.message.chat.id

      console.log("[v0] Web App Data:", webAppData)

      if (webAppData.action === "sync_balance") {
        // Sync game state to database
        if (process.env.MONGODB_URI) {
          const client = await clientPromise
          if (client) {
            const db = client.db("guinea_pig_clicker")
            const users = db.collection("users")

            await users.updateOne(
              { telegramId: webAppData.userId.toString() },
              {
                $set: {
                  guineaTokens: webAppData.guineaTokens || 0,
                  clicks: webAppData.clicks || 0,
                  updatedAt: new Date(),
                },
              },
              { upsert: true },
            )

            console.log("[v0] Balance synced:", webAppData)
          }
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
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
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })

  return response.json()
}

import { NextResponse } from "next/server"

const TON_API = "https://tonapi.io/v2/blockchain/accounts"
const WALLET = "UQATdZnXCLh_2eZgKGNDwlA-Y0lFMsqF3SgdPgfjKPOPstLn"

export async function GET() {
  try {
    const res = await fetch(`${TON_API}/${WALLET}/transactions`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, message: "Ошибка при получении транзакций" })
    }

    const data = await res.json()
    const txs = data.transactions || []

    const recentPayment = txs.find(
      (tx: any) => tx.in_msg && tx.in_msg.value > 10000000 && tx.in_msg.source && Date.now() - tx.utime * 1000 < 300000,
    )

    if (recentPayment) {
      const amountTON = recentPayment.in_msg.value / 1e9
      const gtAmount = Math.floor(amountTON * 100)

      return NextResponse.json({
        success: true,
        from: recentPayment.in_msg.source,
        amount: amountTON,
        gtAmount: gtAmount,
        txHash: recentPayment.hash,
      })
    }

    return NextResponse.json({ success: false, message: "Платеж не найден" })
  } catch (error) {
    console.error("Error checking payment:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" })
  }
}

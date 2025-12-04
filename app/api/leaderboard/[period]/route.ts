import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { period: string } }) {
  try {
    const period = params.period

    // Валидация периода
    if (!["daily", "weekly", "alltime"].includes(period)) {
      return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 })
    }

    // Если MongoDB не настроен, возвращаем пустой список
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "Database not configured",
        },
        { status: 200 },
      )
    }

    // Примерные данные для демонстрации
    const mockLeaderboard = [
      { rank: 1, username: "Player1", gt: 50000, carrots: 500000 },
      { rank: 2, username: "Player2", gt: 45000, carrots: 450000 },
      { rank: 3, username: "Player3", gt: 40000, carrots: 400000 },
    ]

    return NextResponse.json({
      success: true,
      data: mockLeaderboard,
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ success: false, error: "Failed to load leaderboard" }, { status: 500 })
  }
}

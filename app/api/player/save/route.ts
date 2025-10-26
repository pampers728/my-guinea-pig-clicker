import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    if (!clientPromise) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const client = await clientPromise
    const db = client.db("guineapig")
    const collection = db.collection("users")

    const result = await collection.updateOne(
      { _id: new ObjectId(user.userId) },
      {
        $set: {
          carrots: data.carrots || 0,
          guineaTokens: data.guineaTokens || 0,
          telegramStars: data.telegramStars || 0,
          totalClicks: data.totalClicks || 0,
          carrotsPerClickLevel: data.carrotsPerClickLevel || 1,
          maxEnergyLevel: data.maxEnergyLevel || 1,
          level: data.level || 1,
          miners: data.miners || [],
          taskProgress: data.taskProgress || {},
          weeklyTasks: data.weeklyTasks || [],
          lastUpdated: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Player data saved successfully",
      timestamp: new Date().toISOString(),
      modified: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error saving player data:", error)
    return NextResponse.json({ success: false, error: "Failed to save player data" }, { status: 500 })
  }
}

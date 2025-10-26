import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    if (!clientPromise) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { telegramId, username, firstName, lastName, photoUrl } = body

    if (!telegramId) {
      return NextResponse.json({ error: "Telegram ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("guineapig")
    const usersCollection = db.collection("users")

    let user = await usersCollection.findOne({ telegramId })

    if (!user) {
      const newUser = {
        telegramId,
        username: username || `user${telegramId}`,
        firstName: firstName || "",
        lastName: lastName || "",
        photoUrl: photoUrl || "",
        carrots: 0,
        guineaTokens: 0,
        telegramStars: 0,
        totalClicks: 0,
        level: 1,
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      const result = await usersCollection.insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }
    } else {
      await usersCollection.updateOne({ telegramId }, { $set: { lastLogin: new Date() } })
    }

    const token = signToken({
      userId: user._id.toString(),
      telegramId: user.telegramId,
      username: user.username,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

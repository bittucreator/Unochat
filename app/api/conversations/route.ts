import { type NextRequest, NextResponse } from "next/server"
import { getConversations, createConversation } from "@/lib/conversation-service"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const conversations = await getConversations(userId)
    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error retrieving conversations:", error)
    return NextResponse.json(
      { error: "Failed to retrieve conversations", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, model } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const conversation = await createConversation(userId, title, model)
    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

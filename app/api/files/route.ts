import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/file-service"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const messageId = formData.get("messageId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 })
    }

    // Upload file to database
    const result = await uploadFile(file, messageId ? Number.parseInt(messageId) : undefined)

    return NextResponse.json({
      success: true,
      id: result.id,
      filename: result.filename,
      contentType: result.content_type,
      size: result.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

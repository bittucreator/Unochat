import { type NextRequest, NextResponse } from "next/server"
import { getFile } from "@/lib/file-service"

export const runtime = "nodejs"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const fileId = Number.parseInt(params.id)
    if (isNaN(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 })
    }

    const file = await getFile(fileId)
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Return the file with appropriate headers
    return new NextResponse(file.data, {
      headers: {
        "Content-Type": file.content_type,
        "Content-Disposition": `inline; filename="${file.filename}"`,
        "Content-Length": file.size.toString(),
      },
    })
  } catch (error) {
    console.error("Error retrieving file:", error)
    return NextResponse.json(
      { error: "Failed to retrieve file", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

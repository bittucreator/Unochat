"use server"

import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { error: "No file provided" }
  }

  try {
    // Sanitize filename and extract extension
    const originalFilename = file.name.replace(/[^\w\s.-]/g, "")
    const filenameParts = originalFilename.split(".")
    const extension = filenameParts.length > 1 ? filenameParts.pop() : ""

    // Generate a safe filename with proper format
    const safeFilename = nanoid()
    const uniqueFilename = extension ? `${safeFilename}.${extension}` : safeFilename

    // Upload to Vercel Blob with sanitized path
    const blob = await put(uniqueFilename, file, {
      access: "public",
      contentType: file.type || undefined,
    })

    return {
      success: true,
      url: blob.url,
      filename: originalFilename, // Return original filename for display
      contentType: file.type,
      size: file.size,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { error: "Failed to upload file: " + (error instanceof Error ? error.message : String(error)) }
  }
}

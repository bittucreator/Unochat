"use server"

import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { error: "No file provided" }
  }

  try {
    // Generate a unique filename with original extension
    const extension = file.name.split(".").pop()
    const uniqueFilename = `${nanoid()}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    })

    return {
      success: true,
      url: blob.url,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { error: "Failed to upload file" }
  }
}

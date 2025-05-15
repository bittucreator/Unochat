"use server"

import { createZipFromFiles } from "@/lib/utils/zip-generator"
import type { GeneratedFile } from "@/lib/types/nextjs"

/**
 * Generates a ZIP file from an array of generated files
 * @param files Array of generated files
 * @param projectName Name of the project (used for the ZIP file name)
 * @returns Base64 encoded ZIP file
 */
export async function generateZipFile(
  files: GeneratedFile[],
  projectName = "nextjs-project",
): Promise<{ success: boolean; error?: string; base64?: string }> {
  try {
    // Create the ZIP file
    const zipBlob = await createZipFromFiles(files, projectName)

    // Convert the blob to base64
    const buffer = await zipBlob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    return { success: true, base64 }
  } catch (error) {
    console.error("Error generating ZIP file:", error)
    return { success: false, error: (error as Error).message || "Failed to generate ZIP file" }
  }
}

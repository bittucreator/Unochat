"use server"

import { analyzeWebsite } from "@/lib/services/website-analyzer"
import { generateNextjsCode } from "@/lib/services/nextjs-generator"
import type { NextjsGenerationOptions, WebsiteToNextjsConversion } from "@/lib/types/nextjs"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Default options for Next.js code generation
const defaultOptions: NextjsGenerationOptions = {
  framework: "nextjs-app",
  cssFramework: "tailwind",
  useTypeScript: true,
  useEsLint: true,
  components: "shadcn",
  primaryColor: "#7C3AED",
  secondaryColor: "#4F46E5",
  useImageOptimization: true,
  useServerComponents: true,
  useRouteHandlers: true,
}

// Convert website to Next.js code
export async function convertWebsiteToNextjs(
  url: string,
  options: Partial<NextjsGenerationOptions> = {},
): Promise<WebsiteToNextjsConversion> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  try {
    // Validate URL
    try {
      new URL(url)
    } catch (error) {
      throw new Error("Invalid URL. Please enter a valid URL including http:// or https://")
    }

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options }

    // Create a conversion record in the database if user is authenticated
    let conversionRecord = null

    if (userId) {
      const conversionData = {
        user_id: userId,
        url,
        type: "nextjs" as const,
        status: "processing" as const,
        options: mergedOptions,
      }

      const { data, error } = await supabase.from("website_conversions").insert(conversionData).select().single()

      if (error) {
        console.error("Error creating conversion record:", error)
      } else {
        conversionRecord = data
      }
    }

    // Create a new conversion record for the client
    const conversion: WebsiteToNextjsConversion = {
      url,
      status: "processing",
      createdAt: new Date(),
      options: mergedOptions,
    }

    // Analyze the website
    let analysisResult
    try {
      analysisResult = await analyzeWebsite(url)
      if (!analysisResult) {
        throw new Error("Website analysis failed to return data")
      }
    } catch (analysisError) {
      console.error("Error analyzing website:", analysisError)
      throw new Error(`Website analysis failed: ${(analysisError as Error).message || "Unknown error"}`)
    }

    // Generate Next.js code
    let generatedFiles
    try {
      generatedFiles = await generateNextjsCode(analysisResult, mergedOptions)
      if (!generatedFiles || generatedFiles.length === 0) {
        throw new Error("Code generation failed to produce files")
      }
    } catch (generationError) {
      console.error("Error generating Next.js code:", generationError)
      throw new Error(`Code generation failed: ${(generationError as Error).message || "Unknown error"}`)
    }

    // Update conversion record in the database if user is authenticated
    if (userId && conversionRecord) {
      // In a real app, you would upload the generated files to a storage service
      // and provide a download URL. For now, we'll just update the status.
      const { error: updateError } = await supabase
        .from("website_conversions")
        .update({
          status: "completed",
          nextjs_code_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/download/${conversionRecord.id}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversionRecord.id)

      if (updateError) {
        console.error("Error updating conversion record:", updateError)
      }
    }

    // Update conversion record for the client
    conversion.status = "completed"
    conversion.generatedFiles = generatedFiles

    // Revalidate the dashboard page
    revalidatePath("/dashboard")

    return conversion
  } catch (error) {
    console.error("Error converting website to Next.js:", error)

    // Update the conversion record in the database if user is authenticated
    if (userId) {
      await supabase
        .from("website_conversions")
        .update({
          status: "failed",
          error: (error as Error).message,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("url", url)
        .eq("type", "nextjs")
        .eq("status", "processing")
    }

    return {
      url,
      status: "failed",
      createdAt: new Date(),
      error: (error as Error).message || "An unknown error occurred during conversion",
    }
  }
}

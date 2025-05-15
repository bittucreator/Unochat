"use server"

import { analyzeWebsite } from "@/lib/services/website-analyzer"
import { generateNextjsCode } from "@/lib/services/nextjs-generator"
import type { NextjsGenerationOptions, WebsiteToNextjsConversion } from "@/lib/types/nextjs"

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
  try {
    // Create a new conversion record
    const conversion: WebsiteToNextjsConversion = {
      url,
      status: "processing",
      createdAt: new Date(),
      options: { ...defaultOptions, ...options },
    }

    // Analyze the website
    const analysisResult = await analyzeWebsite(url)

    // Generate Next.js code
    const generatedFiles = await generateNextjsCode(analysisResult, conversion.options!)

    // Update conversion record
    conversion.status = "completed"
    conversion.generatedFiles = generatedFiles

    return conversion
  } catch (error) {
    console.error("Error converting website to Next.js:", error)

    return {
      url,
      status: "failed",
      createdAt: new Date(),
      error: (error as Error).message,
    }
  }
}

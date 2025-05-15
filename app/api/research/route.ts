import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { marked } from "marked"

export const maxDuration = 30 // Allow up to 30 seconds for the API call

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const { text, sources = [] } = await generateText({
      model: openai.responses("gpt-4o"),
      prompt: `Research the following topic and provide a comprehensive summary with key points: ${query}. 
      Include relevant facts, different perspectives, and recent developments if applicable.
      Format your response in Markdown with headings, bullet points, and paragraphs for readability.`,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
        }),
      },
      maxTokens: 1500,
    })

    // Convert markdown to HTML for rendering
    const htmlContent = marked(text)

    // Format sources
    const formattedSources = sources.map((source) => ({
      title: source.title || "Untitled Source",
      url: source.url,
    }))

    return NextResponse.json({
      summary: htmlContent,
      sources: formattedSources,
    })
  } catch (error) {
    console.error("Research API error:", error)
    return NextResponse.json({ error: "Failed to process research request" }, { status: 500 })
  }
}

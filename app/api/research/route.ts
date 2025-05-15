import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createAzure, azure } from "@ai-sdk/azure"
import { marked } from "marked"

export const maxDuration = 30 // Allow up to 30 seconds for the API call

export async function POST(request: NextRequest) {
  try {
    // Check if Azure OpenAI credentials are available
    if (!process.env.AZURE_OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Azure OpenAI API key is missing. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    if (!process.env.AZURE_OPENAI_API_ENDPOINT) {
      return NextResponse.json(
        { error: "Azure OpenAI API endpoint is missing. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    if (!process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME) {
      return NextResponse.json(
        { error: "Azure OpenAI API deployment name is missing. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    try {
      // Primary approach: Create a custom Azure OpenAI client with baseURL
      const azureClient = createAzure({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: process.env.AZURE_OPENAI_API_ENDPOINT,
      })

      // Use Azure OpenAI for research
      const { text } = await generateText({
        model: azureClient(process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME),
        prompt: `Research the following topic and provide a comprehensive summary with key points: ${query}. 
        Include relevant facts, different perspectives, and recent developments if applicable.
        Format your response in Markdown with headings, bullet points, and paragraphs for readability.
        
        At the end of your response, include a section titled "## Sources" with a list of 3-5 hypothetical sources that would be relevant for this topic.
        For each source, include a title and a URL in the format: [Title](URL)
        Make the sources realistic and relevant to the topic.`,
        maxTokens: 1500,
      })

      // Convert markdown to HTML for rendering
      const htmlContent = marked(text)

      // Extract sources from the markdown
      const sources = extractSourcesFromMarkdown(text)

      return NextResponse.json({
        summary: htmlContent,
        sources,
        provider: "azure-primary",
      })
    } catch (primaryError) {
      console.error("Primary Azure approach error:", primaryError)

      // Fallback approach: Use the azure function directly with apiKey
      try {
        const { text } = await generateText({
          model: azure(process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME, {
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            apiVersion: "2023-05-15", // Try a specific API version
          }),
          prompt: `Provide a brief summary of the topic: ${query}. 
          Include key facts and information.
          Format your response in simple Markdown.
          
          At the end, list 2-3 sources that would be relevant for this topic in this format:
          ## Sources
          - [Source Title 1](https://example.com/source1)
          - [Source Title 2](https://example.com/source2)`,
          maxTokens: 1000, // Reduced token count for simplicity
        })

        // Convert markdown to HTML for rendering
        const htmlContent = marked(text)

        // Extract sources from the markdown
        const sources = extractSourcesFromMarkdown(text)

        return NextResponse.json({
          summary: htmlContent,
          sources,
          provider: "azure-fallback",
        })
      } catch (fallbackError) {
        console.error("Fallback Azure approach error:", fallbackError)
        throw new Error(
          `Both Azure approaches failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`,
        )
      }
    }
  } catch (error) {
    console.error("Research API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to process research request"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// Helper function to extract sources from markdown text
function extractSourcesFromMarkdown(markdown: string): { title: string; url: string }[] {
  const sources: { title: string; url: string }[] = []

  // Look for the Sources section
  const sourcesSection = markdown.split("## Sources")[1]

  if (sourcesSection) {
    // Extract links using regex - match [Title](URL) pattern
    const linkRegex = /\[(.*?)\]$$(https?:\/\/[^\s)]+)$$/g
    let match

    while ((match = linkRegex.exec(sourcesSection)) !== null) {
      sources.push({
        title: match[1],
        url: match[2],
      })
    }
  }

  // If no sources were found, return some default sources
  if (sources.length === 0) {
    return [
      {
        title: "No sources found in the response",
        url: "https://example.com",
      },
    ]
  }

  return sources
}

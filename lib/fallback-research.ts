import { generateText } from "ai"
import { azure } from "@ai-sdk/azure"
import { marked } from "marked"

interface Source {
  title: string
  url: string
}

interface ResearchResult {
  summary: string
  sources: Source[]
  error?: string
  provider: "azure-primary" | "azure-fallback" | "error"
}

export async function fallbackResearch(query: string): Promise<ResearchResult> {
  try {
    // Check if Azure OpenAI API key is available
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error("Azure OpenAI API key is missing for fallback. Please add it to your environment variables.")
    }

    if (!process.env.AZURE_OPENAI_API_ENDPOINT) {
      throw new Error("Azure OpenAI API endpoint is missing for fallback. Please add it to your environment variables.")
    }

    if (!process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME) {
      throw new Error(
        "Azure OpenAI API deployment name is missing for fallback. Please add it to your environment variables.",
      )
    }

    console.log("Using Azure OpenAI fallback approach...")

    // Alternative approach: Use the azure function directly with apiKey
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

    return {
      summary: htmlContent,
      sources,
      provider: "azure-fallback",
    }
  } catch (error) {
    console.error("Azure fallback research error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return {
      summary: `<p class="text-red-500">Error: Both Azure OpenAI approaches failed.</p>
                <p>Error details: ${errorMessage}</p>
                <p>Please check your API credentials and try again.</p>`,
      sources: [],
      error: errorMessage,
      provider: "error",
    }
  }
}

// Helper function to extract sources from markdown text
function extractSourcesFromMarkdown(markdown: string): Source[] {
  const sources: Source[] = []

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

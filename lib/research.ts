import { generateText } from "ai"
import { createAzure } from "@ai-sdk/azure"
import { marked } from "marked"
import { fallbackResearch } from "./fallback-research"

interface Source {
  title: string
  url: string
}

interface ResearchResult {
  summary: string
  sources: Source[]
  error?: string
  provider?: "azure-primary" | "azure-fallback" | "error"
}

export async function researchTopic(query: string): Promise<ResearchResult> {
  try {
    // Check if Azure OpenAI API key is available
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error("Azure OpenAI API key is missing. Please add it to your environment variables.")
    }

    if (!process.env.AZURE_OPENAI_API_ENDPOINT) {
      throw new Error("Azure OpenAI API endpoint is missing. Please add it to your environment variables.")
    }

    if (!process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME) {
      throw new Error("Azure OpenAI API deployment name is missing. Please add it to your environment variables.")
    }

    console.log("Azure OpenAI credentials found, attempting primary approach...")

    try {
      // Create a custom Azure OpenAI client with baseURL instead of resourceName
      const azure = createAzure({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: process.env.AZURE_OPENAI_API_ENDPOINT,
      })

      // Use Azure OpenAI for research
      const { text } = await generateText({
        model: azure(process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME),
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

      return {
        summary: htmlContent,
        sources,
        provider: "azure-primary",
      }
    } catch (azureError) {
      console.error("Azure OpenAI primary approach error:", azureError)
      console.log("Trying alternative Azure OpenAI approach...")

      // Try fallback to alternative Azure approach
      return await fallbackResearch(query)
    }
  } catch (error) {
    console.error("Research error:", error)

    // Try fallback to alternative Azure approach if the error is related to Azure configuration
    try {
      return await fallbackResearch(query)
    } catch (fallbackError) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      return {
        summary: `<p class="text-red-500">Error: ${errorMessage}</p>
                  <p>Please make sure you have set up the Azure OpenAI API credentials correctly.</p>`,
        sources: [],
        error: errorMessage,
        provider: "error",
      }
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

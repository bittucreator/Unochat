"use server"

import { OpenAI } from "openai"
import { marked } from "marked"

interface Source {
  title: string
  url: string
}

interface ResearchResult {
  summary: string
  sources: Source[]
  error?: string
  provider?: "azure-primary" | "azure-fallback" | "error"
  originalMarkdown?: string
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
      // Create Azure OpenAI client using the OpenAI SDK
      const azureClient = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${process.env.AZURE_OPENAI_API_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME}`,
        defaultQuery: { "api-version": "2023-05-15" },
        defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
      })

      // Use Azure OpenAI for research
      const response = await azureClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
        messages: [
          {
            role: "system",
            content: "You are a helpful research assistant that provides comprehensive information on topics.",
          },
          {
            role: "user",
            content: `Research the following topic and provide a comprehensive summary with key points: ${query}. 
            Include relevant facts, different perspectives, and recent developments if applicable.
            Format your response in Markdown with headings, bullet points, and paragraphs for readability.
            
            At the end of your response, include a section titled "## Sources" with a list of 3-5 hypothetical sources that would be relevant for this topic.
            For each source, include a title and a URL in the format: [Title](URL)
            Make the sources realistic and relevant to the topic.`,
          },
        ],
        max_tokens: 1500,
      })

      const text = response.choices[0]?.message?.content || ""

      // Convert markdown to HTML for rendering
      const htmlContent = marked(text)

      // Extract sources from the markdown
      const sources = extractSourcesFromMarkdown(text)

      return {
        summary: htmlContent,
        sources,
        provider: "azure-primary",
        originalMarkdown: text,
      }
    } catch (azureError) {
      console.error("Azure OpenAI primary approach error:", azureError)
      console.log("Trying alternative Azure OpenAI approach...")

      // Try fallback to alternative Azure approach
      try {
        // Create Azure OpenAI client using the OpenAI SDK with a different configuration
        const azureClient = new OpenAI({
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          baseURL: `${process.env.AZURE_OPENAI_API_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME}`,
          defaultQuery: { "api-version": "2023-07-01-preview" }, // Try a different API version
          defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
        })

        // Use Azure OpenAI for research with a simpler prompt
        const response = await azureClient.chat.completions.create({
          model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
          messages: [
            {
              role: "system",
              content: "You are a helpful research assistant that provides concise information on topics.",
            },
            {
              role: "user",
              content: `Provide a brief summary of the topic: ${query}. 
              Include key facts and information.
              Format your response in simple Markdown.
              
              At the end, list 2-3 sources that would be relevant for this topic in this format:
              ## Sources
              - [Source Title 1](https://example.com/source1)
              - [Source Title 2](https://example.com/source2)`,
            },
          ],
          max_tokens: 1000,
        })

        const text = response.choices[0]?.message?.content || ""

        // Convert markdown to HTML for rendering
        const htmlContent = marked(text)

        // Extract sources from the markdown
        const sources = extractSourcesFromMarkdown(text)

        return {
          summary: htmlContent,
          sources,
          provider: "azure-fallback",
          originalMarkdown: text,
        }
      } catch (fallbackError) {
        console.error("Azure fallback research error:", fallbackError)
        throw new Error(
          `Both Azure approaches failed. Primary: ${azureError.message}, Fallback: ${fallbackError.message}`,
        )
      }
    }
  } catch (error) {
    console.error("Research error:", error)
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

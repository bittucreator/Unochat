import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { marked } from "marked"

export const maxDuration = 30 // Allow up to 30 seconds for the API call

export async function GET(request: NextRequest) {
  try {
    // Get query from URL parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

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

    try {
      // Primary approach: Create Azure OpenAI client
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

      return NextResponse.json({
        summary: htmlContent,
        sources,
        provider: "azure-standard",
        originalMarkdown: text,
      })
    } catch (primaryError) {
      console.error("Azure OpenAI standard approach error:", primaryError)

      // Fallback approach: Use Azure OpenAI with a different API version
      try {
        // Create Azure OpenAI client with a different API version
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

        return NextResponse.json({
          summary: htmlContent,
          sources,
          provider: "azure-alternative",
          originalMarkdown: text,
        })
      } catch (fallbackError) {
        console.error("Azure OpenAI alternative approach error:", fallbackError)
        return NextResponse.json(
          {
            error: `Both Azure OpenAI approaches failed. Standard: ${primaryError.message}, Alternative: ${fallbackError.message}`,
            sources: [],
          },
          { status: 500 },
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

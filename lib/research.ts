import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { marked } from "marked"

interface Source {
  title: string
  url: string
}

interface ResearchResult {
  summary: string
  sources: Source[]
}

export async function researchTopic(query: string): Promise<ResearchResult> {
  try {
    // Use OpenAI's Responses API with web search capability
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

    return {
      summary: htmlContent,
      sources: formattedSources,
    }
  } catch (error) {
    console.error("Research error:", error)
    return {
      summary: `<p>Sorry, there was an error researching "${query}". Please try again later.</p>`,
      sources: [],
    }
  }
}

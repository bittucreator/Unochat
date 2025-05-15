import { researchTopic } from "@/lib/research"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

export async function ResearchContent({ query }: { query: string }) {
  const { summary, sources } = await researchTopic(query)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: summary }} />
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Sources:</h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm bg-muted px-3 py-1 rounded-md hover:bg-muted/80 transition-colors"
              >
                <span className="truncate max-w-[200px]">{source.title}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

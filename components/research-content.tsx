import { researchTopic } from "@/lib/research"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export async function ResearchContent({ query }: { query: string }) {
  const { summary, sources, error, provider = "unknown" } = await researchTopic(query)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Research Summary</CardTitle>
        {provider && (
          <Badge
            variant={provider === "azure-primary" ? "default" : provider === "azure-fallback" ? "secondary" : "outline"}
          >
            {provider === "azure-primary"
              ? "Azure OpenAI"
              : provider === "azure-fallback"
                ? "Azure OpenAI (Fallback)"
                : "Error"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <p>To fix this issue:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Check your Azure OpenAI API credentials in the environment variables</li>
                  <li>Make sure your Azure OpenAI endpoint URL is correct and complete</li>
                  <li>Verify that your deployment name is correct</li>
                  <li>Restart your application</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: summary }} />
          </div>
        )}

        {provider === "azure-fallback" && !error && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This research was performed using the Azure OpenAI fallback approach because the primary approach
              encountered an error.
            </AlertDescription>
          </Alert>
        )}

        {sources.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  )
}

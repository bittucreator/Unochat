"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, AlertCircle, Info, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExportButton } from "@/components/export-button"
import { Skeleton } from "@/components/ui/skeleton"

interface Source {
  title: string
  url: string
}

interface ResearchResult {
  summary: string
  sources: Source[]
  error?: string
  provider?: string
  originalMarkdown?: string
}

export function ResearchContent({ query }: { query: string }) {
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResearch = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/research?query=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch research results")
        }

        setResult(data)
      } catch (err) {
        console.error("Error fetching research:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (query) {
      fetchResearch()
    }
  }, [query])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Researching with Azure OpenAI...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || (result && result.error)) {
    const errorMessage = error || result?.error
    return (
      <Card>
        <CardHeader>
          <CardTitle>Research Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
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
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No research results available. Please try a different query.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Research Summary</CardTitle>
        <div className="flex items-center gap-2">
          {result.provider && (
            <Badge
              variant={
                result.provider === "azure-standard"
                  ? "default"
                  : result.provider === "azure-alternative"
                    ? "secondary"
                    : "outline"
              }
            >
              {result.provider === "azure-standard"
                ? "Azure OpenAI"
                : result.provider === "azure-alternative"
                  ? "Azure OpenAI (Alternative)"
                  : "Azure OpenAI"}
            </Badge>
          )}
          <ExportButton
            title={`Research: ${query}`}
            content={result.summary}
            originalMarkdown={result.originalMarkdown || ""}
            sources={result.sources}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div id="research-content" className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: result.summary }} />
        </div>

        {result.provider === "azure-alternative" && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This research was performed using an alternative Azure OpenAI configuration because the standard approach
              encountered an error.
            </AlertDescription>
          </Alert>
        )}

        {result.sources.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Sources:</h3>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, index) => (
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

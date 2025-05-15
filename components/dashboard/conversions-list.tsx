"use client"

import type { Tables } from "@/lib/supabase/database.types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileCode, Figma } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ConversionsListProps {
  conversions: Tables<"website_conversions">[]
}

export function ConversionsList({ conversions }: ConversionsListProps) {
  if (conversions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You haven't converted any websites yet.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/figma-converter">Try Figma Converter</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/nextjs-generator">Try Next.js Generator</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conversions.map((conversion) => (
        <Card key={conversion.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg truncate" title={conversion.url}>
                {new URL(conversion.url).hostname}
              </CardTitle>
              <Badge
                variant={
                  conversion.status === "completed"
                    ? "default"
                    : conversion.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {conversion.status}
              </Badge>
            </div>
            <CardDescription className="truncate" title={conversion.url}>
              {conversion.url}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {conversion.type === "figma" ? (
                <Figma className="h-4 w-4 text-blue-500" />
              ) : (
                <FileCode className="h-4 w-4 text-purple-500" />
              )}
              <span className="font-medium">{conversion.type === "figma" ? "Figma Design" : "Next.js Code"}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(conversion.created_at), { addSuffix: true })}
            </p>
          </CardContent>
          <CardFooter>
            {conversion.status === "completed" && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link
                  href={
                    conversion.type === "figma" ? conversion.figma_file_url || "#" : conversion.nextjs_code_url || "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {conversion.type === "figma" ? "Open in Figma" : "View Code"}
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

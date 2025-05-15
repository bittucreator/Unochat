import { Suspense } from "react"
import { ResearchContent } from "@/components/research-content"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ResearchResults({ query }: { query: string }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<ResultsSkeleton />}>
        <ResearchContent query={query} />
      </Suspense>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

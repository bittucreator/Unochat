import { ResearchResults } from "@/components/research-results"
import { SearchForm } from "@/components/search-form"
import Link from "next/link"

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const query = searchParams.query || ""

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight">Azure OpenAI Research</h1>
          </Link>
          <div className="w-1/2">
            <SearchForm />
          </div>
        </div>

        <div className="border-b pb-2">
          <h2 className="text-xl font-medium">
            Results for: <span className="font-bold">{query}</span>
          </h2>
        </div>

        <ResearchResults query={query} />
      </div>
    </main>
  )
}

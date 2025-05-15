import { SearchForm } from "@/components/search-form"
import { AzureSetupGuide } from "@/components/azure-setup-guide"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Research Agent</h1>
          <p className="text-lg text-muted-foreground">Ask a question and get summarized information from the web</p>
        </div>

        <SearchForm />

        <AzureSetupGuide />
      </div>
    </main>
  )
}

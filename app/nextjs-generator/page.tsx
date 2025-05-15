import { UrlForm } from "@/components/url-form"
import { NextjsCustomizationPanel } from "@/components/nextjs-customization-panel"
import { NextjsPreview } from "@/components/nextjs-preview"
import { getFigmaAuthState } from "../actions/figma-actions"

export default async function NextjsGeneratorPage() {
  // Fetch auth state to pass to components that need it
  const authState = await getFigmaAuthState()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Website to Next.js Generator</h1>
        <p className="text-muted-foreground">
          Convert any website to Next.js code with Tailwind CSS. Enter a URL below to get started.
        </p>
      </div>

      <UrlForm authState={authState} conversionType="nextjs" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <NextjsCustomizationPanel />
        <div className="lg:col-span-2">
          <NextjsPreview />
        </div>
      </div>
    </div>
  )
}

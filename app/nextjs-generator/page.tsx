import { EnhancedUrlForm as UrlForm } from "@/components/website-to-nextjs-provider"
import { NextjsCustomizationPanel } from "@/components/nextjs-customization-panel"
import { EnhancedNextjsPreview as NextjsPreview } from "@/components/website-to-nextjs-provider"
import { WebsiteToNextjsConversionProvider } from "@/components/website-to-nextjs-provider"
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

      <WebsiteToNextjsConversionProvider authState={authState}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1">
            <UrlForm />
            <NextjsCustomizationPanel />
          </div>
          <div className="col-span-1">
            <NextjsPreview />
          </div>
        </div>
      </WebsiteToNextjsConversionProvider>
    </div>
  )
}

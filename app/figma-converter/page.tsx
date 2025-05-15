import { EnhancedUrlForm as UrlForm } from "@/components/website-to-figma-provider"
import { FigmaCustomizationPanel } from "@/components/figma-customization-panel"
import { EnhancedFigmaPreview as FigmaPreview } from "@/components/website-to-figma-provider"
import { getFigmaAuthState } from "../actions/figma-actions"
import { WebsiteToFigmaConversionProvider } from "@/components/website-to-figma-provider"

export default async function FigmaConverterPage() {
  const authState = await getFigmaAuthState()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Website to Figma Converter</h1>
        <p className="text-muted-foreground">
          Convert any website to a Figma design. Enter a URL below to get started.
        </p>
      </div>

      <WebsiteToFigmaConversionProvider authState={authState}>
        <UrlForm conversionType="figma" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <FigmaCustomizationPanel authState={authState} />
          <div className="lg:col-span-2">
            <FigmaPreview />
          </div>
        </div>
      </WebsiteToFigmaConversionProvider>
    </div>
  )
}

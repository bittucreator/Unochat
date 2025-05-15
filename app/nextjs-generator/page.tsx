import {
  WebsiteToNextjsConversionProvider,
  EnhancedUrlForm,
  EnhancedNextjsPreview,
} from "@/components/website-to-nextjs-provider"
import { NextjsCustomizationPanel } from "@/components/nextjs-customization-panel"

export default function NextjsGeneratorPage() {
  return (
    <WebsiteToNextjsConversionProvider>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Next.js Generator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <EnhancedUrlForm />
            <div className="mt-8">
              <NextjsCustomizationPanel />
            </div>
          </div>
          <div>
            <EnhancedNextjsPreview />
          </div>
        </div>
      </div>
    </WebsiteToNextjsConversionProvider>
  )
}

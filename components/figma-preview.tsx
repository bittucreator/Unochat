"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink } from "lucide-react"
import type { WebsiteToFigmaConversion } from "@/lib/types/figma"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FigmaPreviewProps {
  conversion?: WebsiteToFigmaConversion
  isAuthenticated: boolean
}

export function FigmaPreview({ conversion, isAuthenticated }: FigmaPreviewProps) {
  const [activeTab, setActiveTab] = useState("preview")

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Figma Preview</CardTitle>
          <CardDescription>Preview the output of your website conversion</CardDescription>
        </div>
        {conversion?.figmaFileUrl && (
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <a href={conversion.figmaFileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open in Figma
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!isAuthenticated && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please connect to Figma using the button in the customization panel to enable website to Figma conversion.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-md border bg-muted/40 p-4 h-[500px] flex items-center justify-center">
              {conversion?.status === "completed" && conversion.figmaFileUrl ? (
                <iframe src={`${conversion.figmaFileUrl}/embed`} className="w-full h-full border-0" allowFullScreen />
              ) : conversion?.status === "processing" ? (
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Processing your website conversion...</p>
                </div>
              ) : conversion?.status === "failed" ? (
                <div className="text-center space-y-4 text-destructive">
                  <AlertCircle className="h-12 w-12 mx-auto" />
                  <p>Conversion failed: {conversion.error}</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt="Figma preview placeholder"
                    className="mx-auto rounded-md"
                  />
                  <p className="text-muted-foreground">
                    {isAuthenticated
                      ? 'Enter a URL and click "Convert" to generate a Figma preview'
                      : "Connect to Figma first, then enter a URL to convert"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="components" className="mt-4">
            <div className="rounded-md border bg-muted/40 p-4 h-[500px] flex items-center justify-center">
              {conversion?.status === "completed" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full overflow-auto p-4">
                  {/* Mock components - in a real app, these would be fetched from the Figma API */}
                  <div className="border rounded-md p-4 bg-card">
                    <div className="h-24 bg-muted mb-2 rounded"></div>
                    <p className="text-sm font-medium">Header Component</p>
                  </div>
                  <div className="border rounded-md p-4 bg-card">
                    <div className="h-24 bg-muted mb-2 rounded"></div>
                    <p className="text-sm font-medium">Hero Section</p>
                  </div>
                  <div className="border rounded-md p-4 bg-card">
                    <div className="h-24 bg-muted mb-2 rounded"></div>
                    <p className="text-sm font-medium">Navigation</p>
                  </div>
                  <div className="border rounded-md p-4 bg-card">
                    <div className="h-24 bg-muted mb-2 rounded"></div>
                    <p className="text-sm font-medium">Button</p>
                  </div>
                  <div className="border rounded-md p-4 bg-card">
                    <div className="h-24 bg-muted mb-2 rounded"></div>
                    <p className="text-sm font-medium">Card</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt="Components placeholder"
                    className="mx-auto rounded-md"
                  />
                  <p className="text-muted-foreground">Components will appear here after conversion</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="assets" className="mt-4">
            <div className="rounded-md border bg-muted/40 p-4 h-[500px] flex items-center justify-center">
              {conversion?.status === "completed" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-full overflow-auto p-4">
                  {/* Mock assets - in a real app, these would be fetched from the Figma API */}
                  <div className="border rounded-md p-2 bg-card">
                    <div className="h-16 w-16 bg-primary/20 mx-auto mb-2 rounded"></div>
                    <p className="text-xs text-center">logo.svg</p>
                  </div>
                  <div className="border rounded-md p-2 bg-card">
                    <div className="h-16 w-16 bg-primary/20 mx-auto mb-2 rounded"></div>
                    <p className="text-xs text-center">icon-1.svg</p>
                  </div>
                  <div className="border rounded-md p-2 bg-card">
                    <div className="h-16 w-16 bg-primary/20 mx-auto mb-2 rounded"></div>
                    <p className="text-xs text-center">icon-2.svg</p>
                  </div>
                  <div className="border rounded-md p-2 bg-card">
                    <div className="h-16 w-16 bg-primary/20 mx-auto mb-2 rounded"></div>
                    <p className="text-xs text-center">hero-image.png</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt="Assets placeholder"
                    className="mx-auto rounded-md"
                  />
                  <p className="text-muted-foreground">Assets will appear here after conversion</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

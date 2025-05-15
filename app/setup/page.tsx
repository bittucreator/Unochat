"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SetupPage() {
  const searchParams = useSearchParams()
  const missingParam = searchParams.get("missing")

  let missingVars: Record<string, string[]> = {}

  try {
    if (missingParam) {
      missingVars = JSON.parse(decodeURIComponent(missingParam))
    }
  } catch (error) {
    console.error("Error parsing missing variables:", error)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">TooliQ Setup</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Environment Variables Setup</CardTitle>
            <CardDescription>
              TooliQ requires certain environment variables to be set up before it can function properly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                To set up your environment variables, create a{" "}
                <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file in the root of your project with
                the following variables:
              </p>

              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  {`# Figma API Configuration
FIGMA_CLIENT_ID=your_figma_client_id
FIGMA_CLIENT_SECRET=your_figma_client_secret
FIGMA_REDIRECT_URI=http://localhost:3000/api/figma/callback

# Website Analysis API (for future implementation)
WEBSITE_ANALYSIS_API_KEY=your_analysis_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TooliQ`}
                </pre>
              </div>

              {Object.keys(missingVars).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Missing Environment Variables</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">The following environment variables are missing:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.entries(missingVars).map(([category, vars]) => (
                        <li key={category}>
                          <strong>{category}:</strong> {vars.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <h3 className="text-lg font-semibold mt-6">How to get these variables:</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Figma API:</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      Go to{" "}
                      <a
                        href="https://www.figma.com/developers/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Figma Developer Console
                      </a>
                    </li>
                    <li>Create a new app</li>
                    <li>
                      Set the redirect URI to{" "}
                      <code className="bg-muted px-1 py-0.5 rounded">http://localhost:3000/api/figma/callback</code> for
                      local development
                    </li>
                    <li>Copy the Client ID and Client Secret to your .env.local file</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium">Website Analysis API:</h4>
                  <p>This is a placeholder for future implementation. You can leave it as is for now.</p>
                </div>
              </div>

              <Alert className="mt-6">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>After Setting Up</AlertTitle>
                <AlertDescription>
                  After adding these variables to your .env.local file, restart your Next.js development server for the
                  changes to take effect.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vercel Deployment</CardTitle>
            <CardDescription>
              If you're deploying to Vercel, you'll need to add these environment variables to your project settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your project on the Vercel dashboard</li>
              <li>Navigate to Settings &gt; Environment Variables</li>
              <li>Add each of the environment variables listed above</li>
              <li>
                For the redirect URI, use your production URL:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">https://your-domain.com/api/figma/callback</code>
              </li>
              <li>Deploy your application again for the changes to take effect</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

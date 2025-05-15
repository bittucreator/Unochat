"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isAzureOpenAIConfigured } from "@/lib/azure-openai-client"
import { AlertCircle, CheckCircle } from "lucide-react"

export function AzureOpenAIConfig() {
  const [apiKey, setApiKey] = useState("")
  const [endpoint, setEndpoint] = useState("")
  const [deploymentName, setDeploymentName] = useState("")
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkConfiguration() {
      try {
        setIsChecking(true)
        const configured = await isAzureOpenAIConfigured()
        setIsConfigured(configured)
      } catch (err) {
        setIsConfigured(false)
        setError("Failed to check Azure OpenAI configuration")
      } finally {
        setIsChecking(false)
      }
    }

    checkConfiguration()
  }, [])

  const handleSaveConfig = async () => {
    if (!apiKey.trim() || !endpoint.trim() || !deploymentName.trim()) {
      setError("Please fill in all fields")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // In a real app, you would save this to a secure storage
      // For this demo, we'll just show a success message
      // In production, you would use a server action to securely store the configuration

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsConfigured(true)
      setApiKey("")
      setEndpoint("")
      setDeploymentName("")
    } catch (err) {
      console.error("Error saving Azure OpenAI configuration:", err)
      setError("Failed to save configuration")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Azure OpenAI Configuration</CardTitle>
        <CardDescription>Connect your Linear AI Agent to Azure OpenAI</CardDescription>
      </CardHeader>
      <CardContent>
        {isChecking ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="ml-2">Checking Azure OpenAI configuration...</span>
          </div>
        ) : isConfigured ? (
          <div className="flex items-center rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Azure OpenAI is properly configured and connected.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center rounded-lg bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Your Azure OpenAI API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                type="text"
                placeholder="https://your-resource-name.openai.azure.com"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deployment-name">Deployment Name</Label>
              <Input
                id="deployment-name"
                type="text"
                placeholder="Your deployment name"
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find your deployment name in the Azure OpenAI Studio.
                <a
                  href="https://portal.azure.com/#blade/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/OpenAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-primary underline"
                >
                  Go to Azure OpenAI Studio
                </a>
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {!isConfigured && !isChecking && (
        <CardFooter>
          <Button
            onClick={handleSaveConfig}
            disabled={isSaving || !apiKey.trim() || !endpoint.trim() || !deploymentName.trim()}
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

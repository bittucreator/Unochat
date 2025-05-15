"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isLinearConfigured } from "@/lib/linear-client"
import { AlertCircle, CheckCircle } from "lucide-react"

export function LinearApiConfig() {
  const [apiKey, setApiKey] = useState("")
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkConfiguration() {
      try {
        setIsChecking(true)
        const configured = await isLinearConfigured()
        setIsConfigured(configured)
      } catch (err) {
        setIsConfigured(false)
        setError("Failed to check Linear API configuration")
      } finally {
        setIsChecking(false)
      }
    }

    checkConfiguration()
  }, [])

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError("Please enter a valid API key")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // In a real app, you would save this to a secure storage
      // For this demo, we'll just show a success message
      // In production, you would use a server action to securely store the API key

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsConfigured(true)
      setApiKey("")
    } catch (err) {
      console.error("Error saving API key:", err)
      setError("Failed to save API key")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linear API Configuration</CardTitle>
        <CardDescription>Connect your Linear AI Agent to your Linear workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {isChecking ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="ml-2">Checking Linear API configuration...</span>
          </div>
        ) : isConfigured ? (
          <div className="flex items-center rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Linear API is properly configured and connected.</span>
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
              <Label htmlFor="api-key">Linear API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="lin_api_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can generate an API key in your Linear account settings.
                <a
                  href="https://linear.app/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-primary underline"
                >
                  Go to Linear API settings
                </a>
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {!isConfigured && !isChecking && (
        <CardFooter>
          <Button onClick={handleSaveApiKey} disabled={isSaving || !apiKey.trim()}>
            {isSaving ? "Saving..." : "Save API Key"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

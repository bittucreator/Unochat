"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApiSettingsProps {
  user: User
}

export function ApiSettings({ user }: ApiSettingsProps) {
  const [apiKey, setApiKey] = useState("sk_live_•••••••••••••••••••••••••••••")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleCopyApiKey = () => {
    // In a real app, you would get the actual API key here
    navigator.clipboard.writeText("sk_live_example_api_key_would_be_here")
    toast({
      title: "API key copied",
      description: "Your API key has been copied to the clipboard.",
    })
  }

  const handleGenerateNewKey = () => {
    setIsGenerating(true)

    // Simulate API call
    setTimeout(() => {
      setApiKey("sk_live_" + Math.random().toString(36).substring(2, 30))
      setIsGenerating(false)
      toast({
        title: "New API key generated",
        description: "Your new API key has been generated successfully.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">API Settings</h2>
        <p className="text-muted-foreground mb-6">Manage your API keys and access to the TooliQ API.</p>
      </div>

      <Alert>
        <AlertDescription>
          Your API key has full access to your account. Keep it secure and never share it publicly.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex">
            <div className="relative flex-grow">
              <Input
                id="api-key"
                value={apiKey}
                readOnly
                type={showApiKey ? "text" : "password"}
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="button" variant="outline" onClick={handleCopyApiKey} className="ml-2">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateNewKey}
            disabled={isGenerating}
            className="amie-button"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Key
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">Generating a new key will invalidate your existing key.</p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">API Documentation</h3>
          <p className="text-muted-foreground mb-4">
            Learn how to use the TooliQ API to integrate with your applications.
          </p>
          <Button asChild variant="outline" className="amie-button">
            <a href="/documentation/api" target="_blank" rel="noopener noreferrer">
              View API Documentation
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { LinearApiConfig } from "@/components/linear-api-config"
import { AzureOpenAIConfig } from "@/components/azure-openai-config"
import { supabase } from "@/lib/supabase-client"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    preferred_ai_provider: "azure",
    auto_prioritize: true,
    auto_assign: true,
    deadline_suggestions: true,
    description_analysis: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      // Load user settings
      const loadSettings = async () => {
        setIsLoading(true)
        try {
          const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

          if (error) {
            console.error("Error loading settings:", error)
          } else if (data) {
            setSettings({
              preferred_ai_provider: data.preferred_ai_provider,
              auto_prioritize: data.auto_prioritize,
              auto_assign: data.auto_assign,
              deadline_suggestions: data.deadline_suggestions,
              description_analysis: data.description_analysis,
            })
          }
        } catch (err) {
          console.error("Error:", err)
        } finally {
          setIsLoading(false)
        }
      }

      loadSettings()
    }
  }, [user])

  const handleSaveSettings = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          preferred_ai_provider: settings.preferred_ai_provider,
          auto_prioritize: settings.auto_prioritize,
          auto_assign: settings.auto_assign,
          deadline_suggestions: settings.deadline_suggestions,
          description_analysis: settings.description_analysis,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (err: any) {
      console.error("Error saving settings:", err)
      setError(err.message || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account and application settings." />
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account and application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appearance</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <Switch id="compact-view" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations">
          <div className="space-y-6">
            <LinearApiConfig />
            <AzureOpenAIConfig />

            <Card>
              <CardHeader>
                <CardTitle>Other Integrations</CardTitle>
                <CardDescription>Connect Linear AI with other tools and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Slack</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications and create tasks from Slack</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">GitHub</h3>
                      <p className="text-sm text-muted-foreground">Link tasks to GitHub issues and PRs</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Google Calendar</h3>
                      <p className="text-sm text-muted-foreground">Sync tasks with your calendar</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
              <CardDescription>Configure how the AI assistant works with your tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="mb-4 flex items-center rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-center rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-500">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Settings saved successfully
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Provider</h3>
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">Primary AI Provider</Label>
                  <select
                    id="ai-provider"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={settings.preferred_ai_provider}
                    onChange={(e) =>
                      setSettings({ ...settings, preferred_ai_provider: e.target.value as "azure" | "openai" })
                    }
                    disabled={isLoading}
                  >
                    <option value="azure">Azure OpenAI</option>
                    <option value="openai">OpenAI</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Select which AI provider to use for task analysis and natural language processing.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Assistant</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-prioritize">Auto-prioritize tasks</Label>
                    <p className="text-sm text-muted-foreground">Let AI suggest priority levels for new tasks</p>
                  </div>
                  <Switch
                    id="auto-prioritize"
                    checked={settings.auto_prioritize}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_prioritize: checked })}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-assign">Auto-assign tasks</Label>
                    <p className="text-sm text-muted-foreground">Let AI suggest team members for new tasks</p>
                  </div>
                  <Switch
                    id="auto-assign"
                    checked={settings.auto_assign}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_assign: checked })}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deadline-suggestions">Deadline suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Let AI suggest realistic deadlines based on workload
                    </p>
                  </div>
                  <Switch
                    id="deadline-suggestions"
                    checked={settings.deadline_suggestions}
                    onCheckedChange={(checked) => setSettings({ ...settings, deadline_suggestions: checked })}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="description-analysis">Description analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Let AI analyze and suggest improvements to task descriptions
                    </p>
                  </div>
                  <Switch
                    id="description-analysis"
                    checked={settings.description_analysis}
                    onCheckedChange={(checked) => setSettings({ ...settings, description_analysis: checked })}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving || isLoading}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-task-assigned">Task assigned to you</Label>
                  <Switch id="email-task-assigned" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-task-due">Task due soon</Label>
                  <Switch id="email-task-due" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-mentions">Mentions</Label>
                  <Switch id="email-mentions" defaultChecked />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-task-updates">Task updates</Label>
                  <Switch id="app-task-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-comments">Comments</Label>
                  <Switch id="app-comments" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-ai-insights">AI insights</Label>
                  <Switch id="app-ai-insights" defaultChecked />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

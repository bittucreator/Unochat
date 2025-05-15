"use client"

import type React from "react"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface NotificationSettingsProps {
  user: User
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState({
    email: true,
    conversions: true,
    marketing: false,
    updates: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggle = (key: keyof typeof notifications) => (checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
        <p className="text-muted-foreground mb-6">Manage how and when you receive notifications from TooliQ.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
            </div>
            <Switch id="email-notifications" checked={notifications.email} onCheckedChange={handleToggle("email")} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="conversion-notifications" className="text-base font-medium">
                Conversion Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Get notified when your website conversions are complete</p>
            </div>
            <Switch
              id="conversion-notifications"
              checked={notifications.conversions}
              onCheckedChange={handleToggle("conversions")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-notifications" className="text-base font-medium">
                Marketing Emails
              </Label>
              <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
            </div>
            <Switch
              id="marketing-notifications"
              checked={notifications.marketing}
              onCheckedChange={handleToggle("marketing")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="update-notifications" className="text-base font-medium">
                Product Updates
              </Label>
              <p className="text-sm text-muted-foreground">Get notified about new features and improvements</p>
            </div>
            <Switch
              id="update-notifications"
              checked={notifications.updates}
              onCheckedChange={handleToggle("updates")}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="amie-button">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </form>
    </div>
  )
}

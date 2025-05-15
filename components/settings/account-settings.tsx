"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTwoFactorToggle = async (checked: boolean) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setTwoFactorEnabled(checked)
      setIsLoading(false)

      toast({
        title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        description: checked ? "Your account is now more secure." : "Two-factor authentication has been disabled.",
      })
    }, 1000)
  }

  const handleDeleteAccount = () => {
    toast({
      variant: "destructive",
      title: "Account deletion",
      description: "Please contact support to delete your account.",
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        <p className="text-muted-foreground mb-6">Manage your account security and preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="two-factor" className="text-base font-medium">
              Two-factor authentication
            </Label>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <Switch
            id="two-factor"
            checked={twoFactorEnabled}
            onCheckedChange={handleTwoFactorToggle}
            disabled={isLoading}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Connected Accounts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#4285F4] flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled className="amie-button">
                Connected
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Delete Account</AlertTitle>
            <AlertDescription>
              Once you delete your account, there is no going back. Please be certain.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="destructive" onClick={handleDeleteAccount} className="amie-button">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

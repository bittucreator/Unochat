import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { ApiSettings } from "@/components/settings/api-settings"

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user metadata
  const { data: userMetadata } = await supabase.from("users_metadata").select("*").eq("id", session.user.id).single()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="amie-card">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full border-b rounded-none p-0 h-auto">
            <div className="container flex overflow-auto">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6"
              >
                Account
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6"
              >
                API
              </TabsTrigger>
            </div>
          </TabsList>
          <div className="p-6">
            <TabsContent value="profile">
              <ProfileSettings user={session.user} userMetadata={userMetadata} />
            </TabsContent>
            <TabsContent value="account">
              <AccountSettings user={session.user} />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationSettings user={session.user} />
            </TabsContent>
            <TabsContent value="api">
              <ApiSettings user={session.user} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

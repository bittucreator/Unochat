import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function HistoryPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/dashboard/history")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Conversion History</h1>
      <p className="text-muted-foreground mb-8">View and manage your previous conversions</p>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Conversions</TabsTrigger>
          <TabsTrigger value="figma">Figma Conversions</TabsTrigger>
          <TabsTrigger value="nextjs">Next.js Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">You haven't made any conversions yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="figma">
          <Card>
            <CardHeader>
              <CardTitle>Figma Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">You haven't made any Figma conversions yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nextjs">
          <Card>
            <CardHeader>
              <CardTitle>Next.js Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">You haven't made any Next.js conversions yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Figma, Code } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = user?.user_metadata.full_name
    ? user.user_metadata.full_name.split(" ")[0]
    : user?.email?.split("@")[0] || "there"

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}!</h1>
      <p className="text-muted-foreground mb-8">Choose a tool to get started or view your recent conversions.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/figma-converter" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <Figma className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Figma Converter</CardTitle>
              <CardDescription>Convert websites to Figma designs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transform any website into editable Figma designs with just a URL. Extract components, styles, and more.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/nextjs-generator" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Next.js Generator</CardTitle>
              <CardDescription>Generate Next.js code from websites</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Convert websites into production-ready Next.js code. Get components, layouts, and responsive designs.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/history" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <CardTitle>Recent Conversions</CardTitle>
              <CardDescription>View your conversion history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access your recent website conversions, download previous exports, and continue where you left off.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

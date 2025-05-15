import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Code } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = user?.user_metadata.full_name
    ? user.user_metadata.full_name.split(" ")[0]
    : user?.email?.split("@")[0] || "there"

  // Fetch only Next.js conversions
  const { data: recentConversions } = await supabase
    .from("website_conversions")
    .select("*")
    .eq("type", "nextjs")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}!</h1>
      <p className="text-muted-foreground mb-8">
        Get started with our Next.js generator or view your recent conversions.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/nextjs-generator" className="block md:col-span-2 lg:col-span-3">
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
      </div>

      {/* Recent Activity Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Conversions</h2>

        {recentConversions && recentConversions.length > 0 ? (
          <div className="space-y-4">
            {recentConversions.map((conversion) => (
              <div key={conversion.id} className="amie-card p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Code className="h-10 w-10 text-purple-500 mr-4" />
                  <div>
                    <h3 className="font-medium">{new URL(conversion.url).hostname}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conversion.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      conversion.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : conversion.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {conversion.status}
                  </span>
                  {conversion.status === "completed" && conversion.nextjs_code_url && (
                    <Link
                      href={conversion.nextjs_code_url}
                      className="ml-2 text-sm font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="amie-card p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any conversions yet.</p>
            <p className="text-sm text-muted-foreground">
              Try converting a website to Next.js using the generator above.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

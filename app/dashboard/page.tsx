import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RealTimeConversions } from "@/components/dashboard/real-time-conversions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code, Figma, Clock, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user's conversion history (most recent 5)
  const { data: recentConversions } = await supabase
    .from("website_conversions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get user's name
  const firstName = session.user.user_metadata.full_name
    ? session.user.user_metadata.full_name.split(" ")[0]
    : session.user.email?.split("@")[0] || "there"

  return (
    <div className="container mx-auto px-4 py-12">
      <RealTimeConversions />

      {/* Welcome Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Hey, {firstName}! 👋</h1>
        <p className="text-xl text-muted-foreground">What would you like to create today?</p>
      </section>

      {/* Tools Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="amie-card group hover:scale-[1.02] transition-all duration-300">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Figma className="h-24 w-24 text-white" />
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-3">Website to Figma</h2>
              <p className="text-muted-foreground mb-6">
                Convert any website to a fully editable Figma design with accurate components, styles, and layout.
              </p>
              <Button asChild className="amie-button group-hover:bg-blue-600">
                <Link href="/figma-converter" className="flex items-center">
                  Start Converting <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="amie-card group hover:scale-[1.02] transition-all duration-300">
            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Code className="h-24 w-24 text-white" />
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-3">Website to Next.js</h2>
              <p className="text-muted-foreground mb-6">
                Generate clean, well-structured Next.js code with Tailwind CSS from any website, ready for
                customization.
              </p>
              <Button asChild className="amie-button group-hover:bg-purple-600">
                <Link href="/nextjs-generator" className="flex items-center">
                  Start Generating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/history">View All</Link>
          </Button>
        </div>

        {recentConversions && recentConversions.length > 0 ? (
          <div className="space-y-4">
            {recentConversions.map((conversion) => (
              <div key={conversion.id} className="amie-card p-6 flex items-center justify-between">
                <div className="flex items-center">
                  {conversion.type === "figma" ? (
                    <Figma className="h-10 w-10 text-blue-500 mr-4" />
                  ) : (
                    <Code className="h-10 w-10 text-purple-500 mr-4" />
                  )}
                  <div>
                    <h3 className="font-medium">{new URL(conversion.url).hostname}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
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
                  {conversion.status === "completed" && (
                    <Button variant="ghost" size="sm" asChild className="ml-2">
                      <Link
                        href={
                          conversion.type === "figma"
                            ? conversion.figma_file_url || "#"
                            : conversion.nextjs_code_url || "#"
                        }
                      >
                        View
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="amie-card p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any conversions yet.</p>
            <p className="text-sm text-muted-foreground">
              Try converting a website to Figma or Next.js using the tools above.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

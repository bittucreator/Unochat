import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Figma, Clock } from "lucide-react"
import Link from "next/link"

export default async function HistoryPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user's all conversion history
  const { data: conversions } = await supabase
    .from("website_conversions")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Conversion History</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          {conversions && conversions.length > 0 ? (
            <div className="space-y-4">
              {conversions.map((conversion) => (
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
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You haven't created any conversions yet.</p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="/figma-converter">Try Figma Converter</Link>
                </Button>
                <Button asChild>
                  <Link href="/nextjs-generator">Try Next.js Generator</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

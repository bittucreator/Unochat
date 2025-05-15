import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Code } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HistoryPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user's conversion history
  const { data: conversions } = await supabase
    .from("website_conversions")
    .select("*")
    .eq("type", "nextjs")
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Conversion History</h1>
      <p className="text-muted-foreground mb-8">View all your previous website to Next.js conversions.</p>

      {conversions && conversions.length > 0 ? (
        <div className="space-y-4">
          {conversions.map((conversion) => (
            <div key={conversion.id} className="amie-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{conversion.url}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(conversion.created_at).toLocaleString()}</p>
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
                </div>
              </div>

              {conversion.status === "completed" && (
                <div className="mt-4 flex justify-end">
                  {conversion.nextjs_code_url && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={conversion.nextjs_code_url}>View Code</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="ml-2">
                    <Link href={`/nextjs-generator?url=${encodeURIComponent(conversion.url)}`}>Edit/Regenerate</Link>
                  </Button>
                </div>
              )}

              {conversion.status === "failed" && (
                <div className="mt-4">
                  <p className="text-sm text-red-500">{conversion.error || "Conversion failed"}</p>
                  <div className="flex justify-end mt-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/nextjs-generator?url=${encodeURIComponent(conversion.url)}`}>Try Again</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="amie-card p-8 text-center">
          <p className="text-muted-foreground mb-4">You haven't created any conversions yet.</p>
          <Button asChild>
            <Link href="/nextjs-generator">Create Your First Conversion</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

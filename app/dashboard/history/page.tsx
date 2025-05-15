import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code, Figma, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function HistoryPage() {
  const supabase = createServerSupabaseClient()

  // Fetch all user's conversion history
  const { data: conversions } = await supabase
    .from("website_conversions")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Conversion History</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search conversions..." />
        </div>
      </div>

      {conversions && conversions.length > 0 ? (
        <div className="space-y-4">
          {conversions.map((conversion) => (
            <div
              key={conversion.id}
              className="amie-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
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
                    {new Date(conversion.created_at).toLocaleDateString()} at{" "}
                    {new Date(conversion.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
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
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={
                        conversion.type === "figma"
                          ? conversion.figma_file_url || "#"
                          : conversion.nextjs_code_url || "#"
                      }
                    >
                      View Result
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={
                      conversion.type === "figma"
                        ? `/figma-converter?url=${encodeURIComponent(conversion.url)}`
                        : `/nextjs-generator?url=${encodeURIComponent(conversion.url)}`
                    }
                  >
                    Recreate
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="amie-card p-8 text-center">
          <p className="text-muted-foreground mb-4">You haven't created any conversions yet.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <Button asChild className="amie-button">
              <Link href="/figma-converter" className="flex items-center">
                <Figma className="mr-2 h-4 w-4" /> Try Figma Converter
              </Link>
            </Button>
            <Button asChild className="amie-button">
              <Link href="/nextjs-generator" className="flex items-center">
                <Code className="mr-2 h-4 w-4" /> Try Next.js Generator
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

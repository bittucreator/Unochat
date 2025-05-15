"use client"

import { useState } from "react"
import { saveAs } from "file-saver"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportButtonProps {
  title: string
  content: string
  originalMarkdown: string
  sources: { title: string; url: string }[]
}

export function ExportButton({ title, content, originalMarkdown, sources }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const exportToMarkdown = async () => {
    setIsLoading(true)
    try {
      let markdownContent = `# ${title}\n\n${originalMarkdown}\n\n## Sources\n`

      sources.forEach((source) => {
        markdownContent += `- [${source.title}](${source.url})\n`
      })

      const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" })
      saveAs(blob, `${title}.md`)
      toast({
        title: "Exported!",
        description: "Research exported to markdown file.",
      })
    } catch (error) {
      console.error("Error exporting to markdown:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export research to markdown.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={exportToMarkdown} disabled={isLoading}>
      {isLoading ? "Exporting..." : <Download className="mr-2 h-4 w-4" />}
      Export
    </Button>
  )
}

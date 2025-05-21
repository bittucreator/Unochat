import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Bot } from "lucide-react"

interface ModelBadgeProps {
  model: string
}

export function ModelBadge({ model }: ModelBadgeProps) {
  // Get the display name, icon, and color based on the model ID
  let displayName = model || "Unknown"
  let icon = null

  const modelStr = String(model || "").toLowerCase()

  if (modelStr.indexOf("azure-grok") === 0 || modelStr.indexOf("grok") === 0) {
    displayName = "Grok 3"
    icon = <Zap className="h-3 w-3 mr-1" />
  } else if (modelStr.indexOf("gpt-4") === 0) {
    displayName = "GPT-4o"
    icon = <Sparkles className="h-3 w-3 mr-1" />
  } else if (modelStr.indexOf("gpt-3.5") === 0) {
    displayName = "GPT-3.5"
    icon = <Bot className="h-3 w-3 mr-1" />
  }

  return (
    <Badge className="flex items-center px-2 py-0.5 rounded-md font-medium text-xs bg-vercel-gray-100 text-vercel-gray-800 dark:bg-vercel-gray-800 dark:text-vercel-gray-200 border-none">
      {icon}
      {displayName}
    </Badge>
  )
}

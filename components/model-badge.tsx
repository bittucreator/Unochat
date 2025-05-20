import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Bot } from "lucide-react"

interface ModelBadgeProps {
  model: string
}

export function ModelBadge({ model }: ModelBadgeProps) {
  // Get the display name, icon, and color based on the model ID
  let displayName = model || "Unknown"
  let colorClass = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
  let icon = null

  const modelStr = String(model || "").toLowerCase()

  if (modelStr.indexOf("azure-grok") === 0 || modelStr.indexOf("grok") === 0) {
    displayName = "Grok 3"
    colorClass = "bg-pastel-sky/30 text-pastel-sky dark:bg-pastel-sky/20 dark:text-pastel-sky"
    icon = <Zap className="h-3 w-3 mr-1" />
  } else if (modelStr.indexOf("gpt-4") === 0) {
    displayName = "GPT-4o"
    colorClass = "bg-pastel-mint/30 text-pastel-mint dark:bg-pastel-mint/20 dark:text-pastel-mint"
    icon = <Sparkles className="h-3 w-3 mr-1" />
  } else if (modelStr.indexOf("gpt-3.5") === 0) {
    displayName = "GPT-3.5"
    colorClass = "bg-pastel-peach/30 text-pastel-peach dark:bg-pastel-peach/20 dark:text-pastel-peach"
    icon = <Bot className="h-3 w-3 mr-1" />
  }

  return (
    <Badge className={`${colorClass} flex items-center px-2 py-0.5 rounded-md font-medium text-xs border-none`}>
      {icon}
      {displayName}
    </Badge>
  )
}

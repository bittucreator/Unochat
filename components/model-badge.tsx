import { Badge } from "@/components/ui/badge"

interface ModelBadgeProps {
  model: string
}

export function ModelBadge({ model }: ModelBadgeProps) {
  // Get the display name and color based on the model ID
  let displayName = model || "Unknown"
  let colorClass = "bg-gray-500"

  const modelStr = String(model || "").toLowerCase()

  if (modelStr.indexOf("azure-grok") === 0 || modelStr.indexOf("grok") === 0) {
    displayName = "Grok 3 (Azure)"
    colorClass = "bg-purple-600"
  } else if (modelStr.indexOf("gpt-4") === 0) {
    displayName = "GPT-4o"
    colorClass = "bg-green-600"
  } else if (modelStr.indexOf("gpt-3.5") === 0) {
    displayName = "GPT-3.5"
    colorClass = "bg-blue-600"
  }

  return <Badge className={`${colorClass} text-white`}>{displayName}</Badge>
}

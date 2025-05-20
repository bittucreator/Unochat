import { Badge } from "@/components/ui/badge"

interface ModelBadgeProps {
  model: string
}

export function ModelBadge({ model }: ModelBadgeProps) {
  // Get the display name and color based on the model ID
  let displayName = model
  let colorClass = "bg-gray-500"

  if (model.startsWith("azure-grok")) {
    displayName = "Grok 3 (Azure)"
    colorClass = "bg-purple-600"
  } else if (model.startsWith("gpt-4")) {
    displayName = "GPT-4o"
    colorClass = "bg-green-600"
  } else if (model.startsWith("gpt-3.5")) {
    displayName = "GPT-3.5"
    colorClass = "bg-blue-600"
  }

  return <Badge className={`${colorClass} text-white`}>{displayName}</Badge>
}

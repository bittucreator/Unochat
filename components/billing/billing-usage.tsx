"use client"

import { Progress } from "@/components/ui/progress"

export function BillingUsage() {
  // In a real app, you would fetch this data from your API
  const usage = {
    figmaConversions: {
      used: 3,
      total: 5,
      percentage: 60,
    },
    nextjsConversions: {
      used: 2,
      total: 5,
      percentage: 40,
    },
    apiCalls: {
      used: 0,
      total: 0,
      percentage: 0,
    },
  }

  return (
    <div className="amie-card p-6">
      <h3 className="text-lg font-bold mb-4">Usage This Month</h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Figma Conversions</span>
            <span className="text-muted-foreground">
              {usage.figmaConversions.used} / {usage.figmaConversions.total}
            </span>
          </div>
          <Progress value={usage.figmaConversions.percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Next.js Conversions</span>
            <span className="text-muted-foreground">
              {usage.nextjsConversions.used} / {usage.nextjsConversions.total}
            </span>
          </div>
          <Progress value={usage.nextjsConversions.percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>API Calls</span>
            <span className="text-muted-foreground">
              {usage.apiCalls.total === 0
                ? "Not available on Free plan"
                : `${usage.apiCalls.used} / ${usage.apiCalls.total}`}
            </span>
          </div>
          <Progress value={usage.apiCalls.percentage} className="h-2" />
        </div>
      </div>
    </div>
  )
}

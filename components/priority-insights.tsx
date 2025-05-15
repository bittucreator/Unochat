"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { getTaskStatistics } from "@/lib/linear-api"
import { Skeleton } from "@/components/ui/skeleton"

interface PriorityInsightsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PriorityInsights({ className, ...props }: PriorityInsightsProps) {
  const [data, setData] = useState([
    { name: "High", value: 0, color: "hsl(var(--chart-1))" },
    { name: "Medium", value: 0, color: "hsl(var(--chart-2))" },
    { name: "Low", value: 0, color: "hsl(var(--chart-3))" },
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStatistics() {
      try {
        setLoading(true)
        const stats = await getTaskStatistics()

        setData([
          { name: "High", value: stats.priorityCounts.high, color: "hsl(var(--chart-1))" },
          { name: "Medium", value: stats.priorityCounts.medium, color: "hsl(var(--chart-2))" },
          { name: "Low", value: stats.priorityCounts.low, color: "hsl(var(--chart-3))" },
        ])
      } catch (err) {
        console.error("Error loading task statistics:", err)
        setError("Failed to load priority statistics")
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [])

  return (
    <Card className={cn("col-span-1", className)} {...props}>
      <CardHeader>
        <CardTitle>Priority Breakdown</CardTitle>
        <CardDescription>Distribution of tasks by priority level</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[240px] items-center justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
        ) : error ? (
          <div className="flex h-[240px] items-center justify-center text-center text-muted-foreground">{error}</div>
        ) : (
          <ChartContainer
            config={{
              High: {
                label: "High Priority",
                color: "hsl(var(--chart-1))",
              },
              Medium: {
                label: "Medium Priority",
                color: "hsl(var(--chart-2))",
              },
              Low: {
                label: "Low Priority",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[240px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

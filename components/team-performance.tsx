"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface TeamPerformanceProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TeamPerformance({ className, ...props }: TeamPerformanceProps) {
  const data = [
    {
      name: "Week 1",
      completed: 12,
      created: 18,
    },
    {
      name: "Week 2",
      completed: 15,
      created: 14,
    },
    {
      name: "Week 3",
      completed: 20,
      created: 16,
    },
    {
      name: "Week 4",
      completed: 18,
      created: 12,
    },
    {
      name: "Week 5",
      completed: 22,
      created: 19,
    },
    {
      name: "Week 6",
      completed: 25,
      created: 21,
    },
  ]

  return (
    <Card className={cn("col-span-2", className)} {...props}>
      <CardHeader>
        <CardTitle>Team Velocity</CardTitle>
        <CardDescription>Tasks created vs completed over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            completed: {
              label: "Tasks Completed",
              color: "hsl(var(--chart-1))",
            },
            created: {
              label: "Tasks Created",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" />
              <Bar dataKey="created" fill="var(--color-created)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

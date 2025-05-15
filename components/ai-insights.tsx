"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { fetchHighPriorityTasks, fetchMyTasks } from "@/lib/linear-api"
import { generateTaskInsights } from "@/lib/ai-commands"
import { Lightbulb, Loader2 } from "lucide-react"

interface AIInsightsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AIInsights({ className, ...props }: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true)

        // Fetch tasks for analysis
        const highPriorityTasks = await fetchHighPriorityTasks()
        const myTasks = await fetchMyTasks()

        // Combine tasks for analysis
        const tasksForAnalysis = [...highPriorityTasks, ...myTasks]

        // Generate insights
        const taskInsights = await generateTaskInsights(tasksForAnalysis)
        setInsights(taskInsights)
      } catch (err) {
        console.error("Error loading AI insights:", err)
        setError("Failed to generate AI insights")
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [])

  return (
    <Card className={cn("col-span-full", className)} {...props}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          AI Insights
        </CardTitle>
        <CardDescription>AI-generated insights based on your tasks and team activity</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Generating insights...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-line">{insights}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

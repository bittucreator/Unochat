"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { TaskList } from "@/components/task-list"
import { fetchHighPriorityTasks, fetchMyTasks, fetchRecentTasks } from "@/lib/linear-api"
import type { Task } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface TasksOverviewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TasksOverview({ className, ...props }: TasksOverviewProps) {
  const [highPriorityTasks, setHighPriorityTasks] = useState<Task[]>([])
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState("high-priority")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTasks() {
      setLoading(true)
      setError(null)

      try {
        // Load high priority tasks initially
        const highPriority = await fetchHighPriorityTasks()
        setHighPriorityTasks(highPriority)

        // Load other data based on active tab
        if (activeTab === "my-tasks") {
          const myTasksData = await fetchMyTasks()
          setMyTasks(myTasksData)
        } else if (activeTab === "recent") {
          const recentTasksData = await fetchRecentTasks()
          setRecentTasks(recentTasksData)
        }
      } catch (err) {
        console.error("Error loading tasks:", err)
        setError("Failed to load tasks. Please check your Linear API configuration.")
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [activeTab])

  const handleTabChange = async (value: string) => {
    setActiveTab(value)

    // Load data for the selected tab if not already loaded
    if (value === "my-tasks" && myTasks.length === 0) {
      setLoading(true)
      try {
        const data = await fetchMyTasks()
        setMyTasks(data)
      } catch (err) {
        setError("Failed to load your tasks")
      } finally {
        setLoading(false)
      }
    } else if (value === "recent" && recentTasks.length === 0) {
      setLoading(true)
      try {
        const data = await fetchRecentTasks()
        setRecentTasks(data)
      } catch (err) {
        setError("Failed to load recent tasks")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Card className={cn("col-span-2", className)} {...props}>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Manage and track your tasks with AI-powered insights</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="high-priority" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="high-priority">High Priority</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          {error && <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <TabsContent value="high-priority">
            {loading ? <TaskListSkeleton /> : <TaskList tasks={highPriorityTasks} />}
          </TabsContent>
          <TabsContent value="my-tasks">{loading ? <TaskListSkeleton /> : <TaskList tasks={myTasks} />}</TabsContent>
          <TabsContent value="recent">{loading ? <TaskListSkeleton /> : <TaskList tasks={recentTasks} />}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function TaskListSkeleton() {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-1 h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

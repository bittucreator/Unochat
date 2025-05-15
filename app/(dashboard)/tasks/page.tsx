import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { fetchTasksByStatus } from "@/lib/linear-api"
import { Skeleton } from "@/components/ui/skeleton"

export default function TasksPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Tasks" text="View and manage all your Linear tasks." />
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>View tasks by status and take action</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <Suspense fallback={<TaskListSkeleton />}>
              <TabsContent value="todo">
                <TasksTabContent status="todo" />
              </TabsContent>
              <TabsContent value="in-progress">
                <TasksTabContent status="in_progress" />
              </TabsContent>
              <TabsContent value="completed">
                <TasksTabContent status="completed" />
              </TabsContent>
            </Suspense>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

async function TasksTabContent({ status }: { status: "todo" | "in_progress" | "completed" }) {
  const tasks = await fetchTasksByStatus(status)

  return <TaskList tasks={tasks} />
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

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { mockTasks } from "@/lib/mock-data"
import { AlertCircle, Clock } from "lucide-react"

interface UpcomingDeadlinesProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UpcomingDeadlines({ className, ...props }: UpcomingDeadlinesProps) {
  // Get tasks with due dates, sort by closest due date
  const tasksWithDeadlines = mockTasks
    .filter((task) => task.dueDate && task.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <Card className={cn("col-span-1", className)} {...props}>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>Tasks that need your attention soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasksWithDeadlines.length > 0 ? (
            tasksWithDeadlines.map((task) => {
              const dueDate = new Date(task.dueDate)
              const today = new Date()
              const diffTime = dueDate.getTime() - today.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

              const isUrgent = diffDays <= 2

              return (
                <div key={task.id} className="flex items-start gap-3">
                  {isUrgent ? (
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className={cn("text-xs", isUrgent ? "text-red-500 font-medium" : "text-muted-foreground")}>
                      Due {formatDueDate(task.dueDate)}
                      {isUrgent && " (Urgent)"}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">No upcoming deadlines</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatDueDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow"
  } else {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }
}

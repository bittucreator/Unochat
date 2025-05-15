import { CheckCircle2, Circle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No tasks found</div>
  }

  return (
    <div className="space-y-2 py-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <div className="flex items-center gap-3">
            {task.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <div className="font-medium">{task.title}</div>
              <div className="text-xs text-muted-foreground">
                {task.project} • Updated {formatDate(task.updatedAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                task.priority === "high" && "border-red-200 bg-red-100 text-red-800",
                task.priority === "medium" && "border-yellow-200 bg-yellow-100 text-yellow-800",
                task.priority === "low" && "border-green-200 bg-green-100 text-green-800",
              )}
            >
              {task.priority}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

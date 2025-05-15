import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { TasksOverview } from "@/components/tasks-overview"
import { PriorityInsights } from "@/components/priority-insights"
import { TeamPerformance } from "@/components/team-performance"
import { CommandInput } from "@/components/command-input"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"
import { AIInsights } from "@/components/ai-insights"

export default function Dashboard() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="AI-powered insights and task management for your Linear workspace." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CommandInput className="col-span-full" />
        <AIInsights className="col-span-full" />
        <TasksOverview className="col-span-full md:col-span-2" />
        <PriorityInsights />
        <TeamPerformance className="col-span-full md:col-span-2" />
        <UpcomingDeadlines />
      </div>
    </DashboardShell>
  )
}

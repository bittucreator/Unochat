import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriorityInsights } from "@/components/priority-insights"
import { TeamPerformance } from "@/components/team-performance"

export default function InsightsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="AI Insights" text="AI-generated insights and recommendations for your team." />
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <PriorityInsights className="col-span-1" />
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Analysis of task distribution across team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[240px] items-center justify-center text-muted-foreground">
                  Task distribution chart will appear here
                </div>
              </CardContent>
            </Card>
            <TeamPerformance className="col-span-2" />
          </div>
        </TabsContent>
        <TabsContent value="predictions">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Project Completion Forecast</CardTitle>
                <CardDescription>Predicted completion dates based on current velocity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">Authentication Service</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Predicted: May 25, 2023</div>
                      <div className="text-sm font-medium text-green-600">On track</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[75%] rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">UI Improvements</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Predicted: June 2, 2023</div>
                      <div className="text-sm font-medium text-yellow-600">At risk</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[45%] rounded-full bg-yellow-500"></div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">Performance Optimization</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Predicted: May 30, 2023</div>
                      <div className="text-sm font-medium text-red-600">Delayed</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[30%] rounded-full bg-red-500"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Bottleneck Detection</CardTitle>
                <CardDescription>Potential bottlenecks in your workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium text-red-600">High Risk: Code Review Backlog</div>
                    <p className="text-sm text-muted-foreground">
                      5 pull requests have been waiting for review for more than 3 days, potentially blocking progress
                      on the Authentication Service.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium text-yellow-600">Medium Risk: Resource Allocation</div>
                    <p className="text-sm text-muted-foreground">
                      The UI team is currently assigned to 15 high-priority tasks with overlapping deadlines, which may
                      impact delivery timelines.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium text-green-600">Low Risk: External Dependencies</div>
                    <p className="text-sm text-muted-foreground">
                      Waiting on third-party API documentation updates, but this is not currently blocking any critical
                      path tasks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Actionable suggestions to improve team productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Task Management</h3>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">Redistribute Authentication Tasks</div>
                    <p className="text-sm text-muted-foreground">
                      John has 8 high-priority tasks assigned, while Sarah has capacity. Consider reassigning 3 tasks to
                      balance workload.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">Break Down Complex Task</div>
                    <p className="text-sm text-muted-foreground">
                      "Implement authentication system" is a large task that's been in progress for 2 weeks. Consider
                      breaking it into smaller, more manageable subtasks.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Process Improvements</h3>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">Implement Code Review Rotation</div>
                    <p className="text-sm text-muted-foreground">
                      Code reviews are taking an average of 3.5 days. Consider implementing a daily rotation for code
                      review responsibilities.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">Adjust Sprint Capacity</div>
                    <p className="text-sm text-muted-foreground">
                      The team has missed sprint goals for 3 consecutive sprints. Consider reducing sprint commitments
                      by 20% until velocity stabilizes.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

function Button({ children, variant = "default", size = "default", ...props }) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}

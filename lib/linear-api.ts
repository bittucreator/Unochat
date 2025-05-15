"use server"

import { getLinearClient } from "./linear-client"
import type { Issue } from "@linear/sdk"
import type { Task } from "./types"

// Fetch all tasks (issues) from Linear
export async function fetchTasks(): Promise<Task[]> {
  try {
    const client = await getLinearClient()

    // Fetch issues with related data
    const { nodes: issues } = await client.issues({
      first: 100,
      includeArchived: false,
    })

    // Transform Linear issues to our Task format
    return await Promise.all(issues.map(transformIssueToTask))
  } catch (error) {
    console.error("Error fetching tasks from Linear:", error)
    return []
  }
}

// Fetch high priority tasks
export async function fetchHighPriorityTasks(): Promise<Task[]> {
  try {
    const client = await getLinearClient()

    const { nodes: issues } = await client.issues({
      first: 50,
      filter: {
        priority: { gte: 2 }, // High and Urgent priorities
      },
      includeArchived: false,
    })

    return await Promise.all(issues.map(transformIssueToTask))
  } catch (error) {
    console.error("Error fetching high priority tasks:", error)
    return []
  }
}

// Fetch tasks assigned to the current user
export async function fetchMyTasks(): Promise<Task[]> {
  try {
    const client = await getLinearClient()

    // Get current user
    const { viewer } = await client.viewer

    const { nodes: issues } = await client.issues({
      first: 50,
      filter: {
        assignee: { id: { eq: viewer.id } },
      },
      includeArchived: false,
    })

    return await Promise.all(issues.map(transformIssueToTask))
  } catch (error) {
    console.error("Error fetching my tasks:", error)
    return []
  }
}

// Fetch recent tasks
export async function fetchRecentTasks(): Promise<Task[]> {
  try {
    const client = await getLinearClient()

    const { nodes: issues } = await client.issues({
      first: 20,
      orderBy: "updatedAt",
      includeArchived: false,
    })

    return await Promise.all(issues.map(transformIssueToTask))
  } catch (error) {
    console.error("Error fetching recent tasks:", error)
    return []
  }
}

// Fetch tasks by status
export async function fetchTasksByStatus(status: "todo" | "in_progress" | "completed"): Promise<Task[]> {
  try {
    const client = await getLinearClient()

    // First, get all workflow states to map to our status categories
    const { nodes: states } = await client.workflowStates()

    // Group states by our status categories
    const todoStates = states.filter(
      (state) => state.type === "triage" || state.type === "backlog" || state.type === "unstarted",
    )
    const inProgressStates = states.filter((state) => state.type === "started")
    const completedStates = states.filter((state) => state.type === "completed" || state.type === "canceled")

    let stateIds: string[] = []

    if (status === "todo") {
      stateIds = todoStates.map((state) => state.id)
    } else if (status === "in_progress") {
      stateIds = inProgressStates.map((state) => state.id)
    } else if (status === "completed") {
      stateIds = completedStates.map((state) => state.id)
    }

    const { nodes: issues } = await client.issues({
      first: 50,
      filter: {
        state: { id: { in: stateIds } },
      },
      includeArchived: false,
    })

    return await Promise.all(issues.map(transformIssueToTask))
  } catch (error) {
    console.error(`Error fetching ${status} tasks:`, error)
    return []
  }
}

// Create a new task in Linear
export async function createTask(
  title: string,
  description?: string,
  priority?: "low" | "medium" | "high",
): Promise<Task | null> {
  try {
    const client = await getLinearClient()

    // Get the default team
    const { nodes: teams } = await client.teams()
    if (!teams.length) {
      throw new Error("No teams found in Linear workspace")
    }

    // Map our priority to Linear's priority
    let linearPriority = 0 // Default (No priority)
    if (priority === "low") linearPriority = 1
    if (priority === "medium") linearPriority = 2
    if (priority === "high") linearPriority = 3

    // Create the issue
    const issue = await client.issueCreate({
      title,
      description: description || "",
      teamId: teams[0].id,
      priority: linearPriority,
    })

    if (issue.success && issue.issue) {
      return await transformIssueToTask(issue.issue)
    }

    return null
  } catch (error) {
    console.error("Error creating task in Linear:", error)
    return null
  }
}

// Helper function to transform Linear Issue to our Task format
async function transformIssueToTask(issue: Issue): Promise<Task> {
  // Get state, project, and assignee data
  const state = await issue.state
  const project = await issue.project
  const assignee = await issue.assignee

  // Map Linear priority to our format
  let priority: "low" | "medium" | "high" = "medium"
  if (issue.priority === 0) priority = "low"
  if (issue.priority === 1) priority = "low"
  if (issue.priority === 2) priority = "medium"
  if (issue.priority === 3) priority = "high"
  if (issue.priority === 4) priority = "high"

  // Map Linear state to our status format
  let status: "todo" | "in_progress" | "completed" = "todo"
  if (state) {
    if (state.type === "started") {
      status = "in_progress"
    } else if (state.type === "completed" || state.type === "canceled") {
      status = "completed"
    }
  }

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description || undefined,
    status,
    priority,
    assignee: assignee ? assignee.name : "Unassigned",
    project: project ? project.name : "No Project",
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    dueDate: issue.dueDate || undefined,
  }
}

// Get task statistics for analytics
export async function getTaskStatistics() {
  try {
    const client = await getLinearClient()

    // Get all issues
    const { nodes: issues } = await client.issues({
      first: 100,
      includeArchived: false,
    })

    // Count by priority
    const priorityCounts = {
      high: issues.filter((issue) => issue.priority === 3 || issue.priority === 4).length,
      medium: issues.filter((issue) => issue.priority === 2).length,
      low: issues.filter((issue) => issue.priority === 0 || issue.priority === 1).length,
    }

    return {
      priorityCounts,
      totalTasks: issues.length,
    }
  } catch (error) {
    console.error("Error getting task statistics:", error)
    return {
      priorityCounts: { high: 0, medium: 0, low: 0 },
      totalTasks: 0,
    }
  }
}

"use server"

import { generateText } from "ai"
import { fetchHighPriorityTasks, fetchMyTasks, fetchTasksByStatus } from "./linear-api"
import { getAIModel } from "./ai-provider"
import type { Task } from "./types"

export async function processCommand(command: string): Promise<string> {
  try {
    // First, check if we can handle this command directly
    if (
      command.toLowerCase().includes("high priority") &&
      (command.toLowerCase().includes("tasks") || command.toLowerCase().includes("issues"))
    ) {
      const tasks = await fetchHighPriorityTasks()
      return formatTasksResponse(tasks, "high priority")
    }

    if (
      command.toLowerCase().includes("my tasks") ||
      command.toLowerCase().includes("my issues") ||
      command.toLowerCase().includes("assigned to me")
    ) {
      const tasks = await fetchMyTasks()
      return formatTasksResponse(tasks, "assigned to you")
    }

    if (command.toLowerCase().includes("todo") || command.toLowerCase().includes("to do")) {
      const tasks = await fetchTasksByStatus("todo")
      return formatTasksResponse(tasks, "to-do")
    }

    if (command.toLowerCase().includes("in progress")) {
      const tasks = await fetchTasksByStatus("in_progress")
      return formatTasksResponse(tasks, "in progress")
    }

    if (command.toLowerCase().includes("completed")) {
      const tasks = await fetchTasksByStatus("completed")
      return formatTasksResponse(tasks, "completed")
    }

    // For other commands, use AI to generate a response
    const model = await getAIModel()

    const { text } = await generateText({
      model,
      prompt: `You are an AI assistant for a Linear task management system. 
      Respond to this user command as if you've processed it and taken action: "${command}"
      Keep your response under 150 words and focus on what action was taken.`,
      system: "You are a helpful AI assistant for Linear task management.",
    })

    return text
  } catch (error) {
    console.error("Error processing command:", error)
    return "Sorry, I couldn't process that command. Please try again."
  }
}

// Helper function to format task responses
function formatTasksResponse(tasks: Task[], type: string) {
  if (tasks.length === 0) {
    return `I couldn't find any ${type} tasks.`
  }

  const taskList = tasks
    .slice(0, 5)
    .map((task) => `• ${task.title} (${task.priority} priority)`)
    .join("\n")

  return `Here are your ${type} tasks:\n\n${taskList}${tasks.length > 5 ? "\n\n...and " + (tasks.length - 5) + " more" : ""}`
}

// Advanced AI functions using Azure OpenAI

// Analyze task description and suggest improvements
export async function analyzeTaskDescription(description: string): Promise<string> {
  try {
    const model = await getAIModel()

    const { text } = await generateText({
      model,
      prompt: `Analyze this task description and suggest improvements to make it clearer and more actionable:
      
      "${description}"
      
      Provide specific suggestions for improvement, focusing on clarity, actionability, and completeness.`,
      system: "You are an expert in task management and technical writing.",
    })

    return text
  } catch (error) {
    console.error("Error analyzing task description:", error)
    return "I couldn't analyze this task description. Please try again."
  }
}

// Suggest task priority based on description
export async function suggestTaskPriority(title: string, description: string): Promise<"low" | "medium" | "high"> {
  try {
    const model = await getAIModel()

    const { text } = await generateText({
      model,
      prompt: `Based on this task title and description, suggest an appropriate priority level (low, medium, or high):
      
      Title: "${title}"
      Description: "${description}"
      
      Respond with only one word: "low", "medium", or "high".`,
      system: "You are an expert in task prioritization and project management.",
    })

    const priority = text.trim().toLowerCase()

    if (priority === "low" || priority === "medium" || priority === "high") {
      return priority as "low" | "medium" | "high"
    }

    // Default to medium if the response is not valid
    return "medium"
  } catch (error) {
    console.error("Error suggesting task priority:", error)
    return "medium"
  }
}

// Estimate task completion time
export async function estimateTaskTime(title: string, description: string): Promise<string> {
  try {
    const model = await getAIModel()

    const { text } = await generateText({
      model,
      prompt: `Based on this task title and description, estimate how long it might take to complete:
      
      Title: "${title}"
      Description: "${description}"
      
      Provide a time estimate in hours or days, and a brief explanation of your reasoning.`,
      system: "You are an expert in software development task estimation.",
    })

    return text
  } catch (error) {
    console.error("Error estimating task time:", error)
    return "I couldn't estimate the time for this task."
  }
}

// Generate task insights from a list of tasks
export async function generateTaskInsights(tasks: Task[]): Promise<string> {
  try {
    if (tasks.length === 0) {
      return "No tasks available to analyze."
    }

    const model = await getAIModel()

    // Format tasks for the prompt
    const tasksFormatted = tasks
      .map(
        (task) =>
          `Title: ${task.title}
       Priority: ${task.priority}
       Status: ${task.status}
       Assignee: ${task.assignee}
       Project: ${task.project}
       ${task.description ? `Description: ${task.description}` : ""}`,
      )
      .join("\n\n")

    const { text } = await generateText({
      model,
      prompt: `Analyze these tasks and provide insights about workload, priorities, and potential bottlenecks:
      
      ${tasksFormatted}
      
      Provide 3-5 key insights that would be helpful for project management.`,
      system: "You are an expert in project management and team productivity analysis.",
    })

    return text
  } catch (error) {
    console.error("Error generating task insights:", error)
    return "I couldn't generate insights for these tasks."
  }
}

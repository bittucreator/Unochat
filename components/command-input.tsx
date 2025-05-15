"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { processCommand, suggestTaskPriority, analyzeTaskDescription } from "@/lib/ai-commands"
import { createTask } from "@/lib/linear-api"
import { generateText } from "ai"
import { getAIModel } from "@/lib/ai-provider"

interface CommandInputProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CommandInput({ className, ...props }: CommandInputProps) {
  const [command, setCommand] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    setIsProcessing(true)
    try {
      // Process the command with AI
      const aiResponse = await processCommand(command)

      // Check if this is a task creation command
      if (
        command.toLowerCase().includes("create") &&
        (command.toLowerCase().includes("task") || command.toLowerCase().includes("issue"))
      ) {
        // Extract task details using AI
        const taskDetails = await extractTaskDetails(command)

        if (taskDetails) {
          // If we have a description, analyze it and suggest improvements
          let descriptionAnalysis = ""
          if (taskDetails.description) {
            descriptionAnalysis = await analyzeTaskDescription(taskDetails.description)
          }

          // Suggest priority if not specified
          if (!taskDetails.priority) {
            taskDetails.priority = await suggestTaskPriority(taskDetails.title, taskDetails.description || "")
          }

          // Create the task in Linear
          const task = await createTask(
            taskDetails.title,
            taskDetails.description,
            taskDetails.priority as "low" | "medium" | "high",
          )

          if (task) {
            let responseText = `✅ Created task "${task.title}" with ${task.priority} priority in Linear.`

            // Add description analysis if available
            if (descriptionAnalysis) {
              responseText += `\n\n**Description Analysis:**\n${descriptionAnalysis}`
            }

            setResponse(responseText)
          } else {
            setResponse(
              "I tried to create a task in Linear but encountered an issue. Please check your Linear API configuration.",
            )
          }
        } else {
          setResponse(aiResponse)
        }
      } else {
        setResponse(aiResponse)
      }
    } catch (error) {
      console.error("Error processing command:", error)
      setResponse("Sorry, I couldn't process that command. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper function to extract task details from a command
  async function extractTaskDetails(command: string) {
    try {
      const model = await getAIModel()

      const { text } = await generateText({
        model,
        prompt: `Extract task details from this command: "${command}"
        Return a JSON object with these fields:
        - title: The task title
        - description: A brief description (or null if not provided)
        - priority: The priority level (low, medium, or high)
        
        If this doesn't seem like a task creation command, return null.`,
        system: "You are a helpful AI assistant for Linear task management.",
      })

      try {
        const parsed = JSON.parse(text)
        return parsed
      } catch (e) {
        console.error("Failed to parse task details:", e)
        return null
      }
    } catch (e) {
      console.error("Error extracting task details:", e)
      return null
    }
  }

  return (
    <Card className={cn("col-span-full", className)} {...props}>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>Ask questions or give commands in natural language</CardDescription>
      </CardHeader>
      <CardContent>
        {response && (
          <div className="mb-4 rounded-lg bg-muted p-4">
            <p className="text-sm whitespace-pre-line">{response}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            placeholder="What are my high-priority tasks this week?"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isProcessing}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Try: "Create a bug report for the login issue" or "Show me team velocity"
      </CardFooter>
    </Card>
  )
}

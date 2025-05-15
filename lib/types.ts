export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  assignee: string
  project: string
  createdAt: string
  updatedAt: string
  dueDate?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  teamId: string
}

export interface Team {
  id: string
  name: string
  members: User[]
}

export interface AICommandResult {
  message: string
  action?: {
    type: string
    payload: any
  }
}

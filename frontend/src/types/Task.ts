export interface Task {
  id: number
  title: string
  description?: string | null
  isCompleted: boolean
  createdAt: string
  dueDate?: string | null
}

export interface CreateTaskPayload {
  title: string
  description?: string
  dueDate?: string
}

export interface UpdateTaskPayload {
  title: string
  description?: string
  isCompleted: boolean
  dueDate?: string
}

export interface AuthResponse {
  token: string
  username: string
}

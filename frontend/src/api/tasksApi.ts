import axios from 'axios'
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/Task'

const BASE = '/api/tasks'

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export async function getTasks(): Promise<Task[]> {
  const { data } = await axios.get<Task[]>(BASE, { headers: authHeaders() })
  return data
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await axios.post<Task>(BASE, payload, { headers: authHeaders() })
  return data
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await axios.put<Task>(`${BASE}/${id}`, payload, { headers: authHeaders() })
  return data
}

export async function deleteTask(id: number): Promise<void> {
  await axios.delete(`${BASE}/${id}`, { headers: authHeaders() })
}

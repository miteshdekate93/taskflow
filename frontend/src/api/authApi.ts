import axios from 'axios'
import type { AuthResponse } from '../types/Task'

const BASE = '/api/auth'

export async function register(username: string, password: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${BASE}/register`, { username, password })
  return data
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${BASE}/login`, { username, password })
  return data
}

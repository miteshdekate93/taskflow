import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasksApi'
import type { CreateTaskPayload, UpdateTaskPayload } from '../types/Task'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'

export default function TasksPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const username = localStorage.getItem('username') ?? 'User'

  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskPayload }) =>
      updateTask(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const completedCount = tasks.filter(t => t.isCompleted).length
  const totalCount = tasks.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-sm text-gray-500">Hello, {username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Progress */}
        {totalCount > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{completedCount} of {totalCount} completed</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Add Task Form */}
        <TaskForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          isLoading={createMutation.isPending}
        />

        {/* Task List */}
        {isLoading && (
          <div className="text-center py-12 text-gray-400">Loading tasks…</div>
        )}

        {isError && (
          <div className="text-center py-12 text-red-500">
            Failed to load tasks. Please try again.
          </div>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">No tasks yet</p>
            <p className="text-sm mt-1">Add your first task above</p>
          </div>
        )}

        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={(id, payload) => updateMutation.mutate({ id, payload })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

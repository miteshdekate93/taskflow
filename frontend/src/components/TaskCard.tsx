import { useState } from 'react'
import type { Task, UpdateTaskPayload } from '../types/Task'

interface TaskCardProps {
  task: Task
  onToggle: (id: number, payload: UpdateTaskPayload) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, payload: UpdateTaskPayload) => void
}

export default function TaskCard({ task, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '')

  const handleToggle = () => {
    onToggle(task.id, {
      title: task.title,
      description: task.description ?? undefined,
      isCompleted: !task.isCompleted,
      dueDate: task.dueDate ?? undefined,
    })
  }

  const handleSave = () => {
    if (!title.trim()) return
    onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      isCompleted: task.isCompleted,
      dueDate: dueDate || undefined,
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
    setEditing(false)
  }

  const formattedDue = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null

  if (editing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Task title *"
          autoFocus
        />
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Description (optional)"
        />
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 flex items-start gap-3 transition-opacity ${task.isCompleted ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={handleToggle}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}
        {formattedDue && (
          <p className="text-xs text-indigo-500 mt-1">Due: {formattedDue}</p>
        )}
      </div>
      <button
        onClick={() => setEditing(true)}
        className="text-gray-400 hover:text-indigo-500 transition-colors text-sm font-medium shrink-0"
        aria-label="Edit task"
      >
        ✎
      </button>
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-500 transition-colors text-sm font-medium shrink-0"
        aria-label="Delete task"
      >
        &#x2715;
      </button>
    </div>
  )
}

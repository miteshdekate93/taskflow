import type { Task, UpdateTaskPayload } from '../types/Task'

interface TaskCardProps {
  task: Task
  onToggle: (id: number, payload: UpdateTaskPayload) => void
  onDelete: (id: number) => void
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const handleToggle = () => {
    onToggle(task.id, {
      title: task.title,
      description: task.description ?? undefined,
      isCompleted: !task.isCompleted,
      dueDate: task.dueDate ?? undefined,
    })
  }

  const formattedDue = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null

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
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-500 transition-colors text-sm font-medium shrink-0"
        aria-label="Delete task"
      >
        &#x2715;
      </button>
    </div>
  )
}

"use client"

import type { Task } from "@/lib/types"
import TaskCard from "@/components/task-card"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: number) => void
}

export default function TaskList({ tasks, isLoading, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No tasks found</h3>
        <p className="text-muted-foreground">Create a new task to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.task_id} task={task} onTaskUpdated={onTaskUpdated} onTaskDeleted={onTaskDeleted} />
      ))}
    </div>
  )
}

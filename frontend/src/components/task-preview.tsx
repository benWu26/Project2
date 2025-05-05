"use client"

import { format, parseISO } from "date-fns"
import { Clock, CheckCircle, Circle } from "lucide-react"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskPreviewProps {
  task: Task
  position: { x: number; y: number }
}

export function TaskPreview({ task, position }: TaskPreviewProps) {
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":").map(Number)
    return format(new Date().setHours(hours, minutes), "h:mm a")
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy")
  }

  const getPriorityColor = (importance: number | undefined) => {
    if (!importance) return "text-gray-500"
    return importance === 3 ? "text-red-500 font-medium" : importance === 2 ? "text-amber-500" : "text-green-500"
  }

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          {task.finished ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={cn("font-medium text-base", task.finished ? "line-through text-gray-500" : "")}>
              {task.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {task.due_time && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(task.due_time)}
                </div>
              )}
              <div>{formatDate(task.due_date)}</div>
            </div>
          </div>
        </div>

        {task.description && (
          <div className="text-sm text-gray-600 pl-7 border-l-2 border-gray-100 ml-1 py-1">{task.description}</div>
        )}

        {task.importance && (
          <div className="pl-7 text-sm flex items-center">
            <span className="font-medium mr-1">Priority:</span>
            <span className={getPriorityColor(task.importance)}>
              {task.importance === 3 ? "High" : task.importance === 2 ? "Medium" : "Low"}
            </span>
          </div>
        )}

        {task.date_made && (
          <div className="pl-7 text-xs text-gray-500">Created: {format(parseISO(task.date_made), "MMM d, yyyy")}</div>
        )}

        {task.date_finished && (
          <div className="pl-7 text-xs text-gray-500">
            Completed: {format(parseISO(task.date_finished), "MMM d, yyyy")}
          </div>
        )}

        <div className="text-xs text-gray-500 pl-7 italic mt-2">Drag to reschedule • Click to edit</div>
      </div>
    </div>
  )
}

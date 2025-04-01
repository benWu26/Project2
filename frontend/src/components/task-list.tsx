"use client"

import { useState } from "react"
import type { Task } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, MoreVertical, Trash, Edit, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import TaskEditDialog from "./task-edit-dialog"

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (task: Task) => void
  onDeleteTask: (taskId: number) => void
  onUpdateTask: (taskId: number, task: Partial<Task>) => void
}

export default function TaskList({ tasks, onToggleComplete, onDeleteTask, onUpdateTask }: TaskListProps) {
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  const formatDate = (dateString: string) => {
    try {
      // If the dateString is already in YYYY-MM-DD format, just parse it
      if (dateString.length === 10 && dateString.includes("-")) {
        return format(new Date(dateString + "T00:00:00"), "MMM d, yyyy")
      }
      // Otherwise, try to parse it as a full ISO string
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      console.error("Invalid date format:", dateString)
      return dateString
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return null
    return timeString
  }

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task)
  }

  const handleEditClose = () => {
    setTaskToEdit(null)
  }

  const handleEditSave = (taskId: number, updatedTask: Partial<Task>) => {
    onUpdateTask(taskId, updatedTask)
    setTaskToEdit(null)
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.task_id} className={task.finished ? "opacity-75" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id={`task-${task.task_id}`}
                checked={task.finished}
                onCheckedChange={() => onToggleComplete(task)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-medium text-lg ${task.finished ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </h3>
                    {task.description && <p className="text-muted-foreground mt-1">{task.description}</p>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      
                      <DropdownMenuItem onClick={() => onDeleteTask(task.task_id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  {task.importance && task.importance > 0 && (
                    <div className="flex items-center text-xs">
                      <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
                      Priority: {task.importance}
                    </div>
                  )}
                  <div className="flex items-center text-xs">
                    <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                    Due: {formatDate(task.due_date)}
                  </div>
                  {task.due_time && (
                    <div className="flex items-center text-xs">
                      <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                      {formatTime(task.due_time)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            {task.finished ? "Status: Completed" : "Status: Active"}
          </CardFooter>
        </Card>
      ))}

      {taskToEdit && <TaskEditDialog task={taskToEdit} onClose={handleEditClose} onSave={handleEditSave} />}
    </div>
  )
}


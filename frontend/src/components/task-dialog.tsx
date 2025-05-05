"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Task } from "@/lib/types"
import TaskForm from "@/components/task-form"
import { updateTask } from "@/lib/api"

interface TaskDialogProps {
  isOpen: boolean
  task: Task | null
  userId: number
  onClose: () => void
  onSave: (task: Task) => void
}

export function TaskDialog({ isOpen, task, userId, onClose, onSave }: TaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleTaskUpdated = (updatedTask: Task) => {
    onSave(updatedTask)
  }

  const handleTaskAdded = (newTask: Task) => {
    onSave(newTask)
  }

  const handleToggleComplete = async () => {
    if (!task) return

    setIsLoading(true)
    try {
      const updatedTask = await updateTask(task.task_id, {
        finished: !task.finished,
      })
      onSave(updatedTask)
    } catch (error) {
      console.error("Error toggling task completion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task && task.task_id ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        {task ? (
          <TaskForm userId={userId} existingTask={task} onTaskUpdated={handleTaskUpdated} />
        ) : (
          <TaskForm userId={userId} onTaskAdded={handleTaskAdded} />
        )}

        {task && (
          <DialogFooter className="mt-4 border-t pt-4">
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="task-completed"
                  checked={task.finished}
                  onCheckedChange={handleToggleComplete}
                  disabled={isLoading}
                />
                <Label htmlFor="task-completed" className="ml-2">
                  Mark as {task.finished ? "incomplete" : "completed"}
                </Label>
              </div>
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

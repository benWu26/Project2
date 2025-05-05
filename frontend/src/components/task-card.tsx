"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Calendar, Clock, Edit, Trash, CheckCircle, Circle } from "lucide-react"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TaskForm from "@/components/task-form"
import { deleteTask, updateTask } from "@/lib/api"

interface TaskCardProps {
  task: Task
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: number) => void
}

export default function TaskCard({ task, onTaskUpdated, onTaskDeleted }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  /*const handleMarkComplete = async () => {
    setIsLoading(true)
    try {
      await markTaskComplete(task.task_id)
      onTaskUpdated({
        ...task,
        finished: true,
        date_finished: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error marking task as complete:", error)
    } finally {
      setIsLoading(false)
    }
  }*/

  const handleToggleComplete = async () => {
    setIsLoading(true)
    try {
      const updatedTask = await updateTask(task.task_id, {
        finished: !task.finished,
      })
      onTaskUpdated(updatedTask)
    } catch (error) {
      console.error("Error toggling task completion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsLoading(true)
      try {
        await deleteTask(task.task_id)
        onTaskDeleted(task.task_id)
      } catch (error) {
        console.error("Error deleting task:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getImportanceBadge = () => {
    switch (task.importance) {
      case 1:
        return <Badge variant="outline">Low</Badge>
      case 2:
        return <Badge variant="secondary">Medium</Badge>
      case 3:
        return <Badge variant="destructive">High</Badge>
      default:
        return null
    }
  }

  return (
    <>
      <Card className={`overflow-hidden ${task.finished ? "bg-muted" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className={`${task.finished ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(parseISO(task.due_date), "MMM d, yyyy")}</span>

                  {task.due_time && (
                    <>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{task.due_time}</span>
                    </>
                  )}
                </div>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">{getImportanceBadge()}</div>
          </div>
        </CardHeader>

        <CardContent>
          {task.description && (
            <p className={`text-sm ${task.finished ? "text-muted-foreground" : ""}`}>{task.description}</p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleToggleComplete} disabled={isLoading}>
              {task.finished ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} disabled={isLoading}>
              <Edit className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isLoading}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          {task.date_finished && (
            <span className="text-xs text-muted-foreground">
              Completed: {format(parseISO(task.date_finished), "MMM d, yyyy")}
            </span>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            userId={task.user_id}
            existingTask={task}
            onTaskUpdated={(updatedTask) => {
              onTaskUpdated(updatedTask)
              setIsEditDialogOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

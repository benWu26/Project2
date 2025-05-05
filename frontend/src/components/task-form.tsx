"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Task, TaskCreate, TaskUpdate } from "@/lib/types"
import { createTask, updateTask } from "@/lib/api"
import { useAlert } from "@/components/ui-alert-dialog"

interface TaskFormProps {
  userId: number
  existingTask?: Task
  onTaskAdded?: (task: Task) => void
  onTaskUpdated?: (task: Task) => void
}

export default function TaskForm({ userId, existingTask, onTaskAdded, onTaskUpdated }: TaskFormProps) {
  const [title, setTitle] = useState(existingTask?.title || "")
  const [description, setDescription] = useState(existingTask?.description || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(() => {
    if (!existingTask?.due_date) return undefined

    // Parse the date string and adjust for timezone
    // This ensures we get the correct local date regardless of timezone
    const dateParts = existingTask.due_date.split("-").map(Number)
    // Note: month is 0-indexed in JavaScript Date
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12)
  })
  const [dueTime, setDueTime] = useState(existingTask?.due_time || "")
  const [importance, setImportance] = useState<string>(
    existingTask?.importance ? existingTask.importance.toString() : "2",
  )
  const [isLoading, setIsLoading] = useState(false)
  const { showAlert } = useAlert()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      await showAlert("Validation Error", "Title is required")
      return
    }

    if (!dueDate) {
      await showAlert("Validation Error", "Due date is required")
      return
    }

    setIsLoading(true)

    try {
      const formattedDate = format(dueDate, "yyyy-MM-dd")

      if (existingTask) {
        // Update existing task
        const taskUpdate: TaskUpdate = {
          title,
          description: description || undefined,
          due_date: formattedDate,
          due_time: dueTime || undefined,
          importance: importance ? Number.parseInt(importance) : undefined,
        }

        const updatedTask = await updateTask(existingTask.task_id, taskUpdate)
        onTaskUpdated?.(updatedTask)
      } else {
        // Create new task
        const taskCreate: TaskCreate = {
          title,
          description: description || undefined,
          due_date: formattedDate,
          due_time: dueTime || undefined,
          importance: importance ? Number.parseInt(importance) : undefined,
          user_id: userId,
          finished: false,
        }

        const newTask = await createTask(taskCreate)
        onTaskAdded?.(newTask)
      }

      // Reset form if creating a new task
      if (!existingTask) {
        setTitle("")
        setDescription("")
        setDueDate(undefined)
        setDueTime("")
        setImportance("2")
      }
    } catch (error) {
      console.error("Error saving task:", error)
      await showAlert("Error", "Failed to save task. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description (optional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueTime">Due Time (optional)</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="dueTime"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="importance">Importance</Label>
        <Select value={importance} onValueChange={setImportance}>
          <SelectTrigger>
            <SelectValue placeholder="Select importance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Low</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : existingTask ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}

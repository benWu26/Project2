import type React from "react"

import { useState } from "react"
import type { Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TaskFormProps {
  userId: number
  onCreateTask: (task: Omit<Task, "task_id">) => void
}

export default function TaskForm({ userId, onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
  const [dueTime, setDueTime] = useState("")
  const [importance, setImportance] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!dueDate) {
      setError("Due date is required")
      return
    }

    setIsSubmitting(true)

    try {
      // Create a new date object and set time to midnight
      const dateWithZeroTime = new Date(dueDate)
      dateWithZeroTime.setHours(0, 0, 0, 0)

      const newTask: Omit<Task, "task_id"> = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dateWithZeroTime.toISOString().split("T")[0],
        due_time: dueTime || undefined,
        importance: importance || undefined,
        user_id: userId,
        finished: false,
      }

      await onCreateTask(newTask)

      // Reset form
      setTitle("")
      setDescription("")
      setDueDate(new Date())
      setDueTime("")
      setImportance(0)
      setError(null)
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Failed to create task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due-date">Due Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due-time">Due Time</Label>
        <Input id="due-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="importance">Priority</Label>
        <Select value={importance.toString()} onValueChange={(value) => setImportance(Number.parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None</SelectItem>
            <SelectItem value="1">Low</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </Button>
    </form>
  )
}


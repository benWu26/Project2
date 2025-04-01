import { useState, useEffect, useMemo } from "react"
import { format, addDays, startOfToday, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Task, Project} from "@/types"
import { mockTasks, mockProjects, currentUser, getNextId, getColorHex } from "@/lib/mock-data"

export default function CalendarView() {
  const today = startOfToday()
  const [selectedDate, setSelectedDate] = useState(today)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [userId, setUserId] = useState<number>(1) // Default to 1 for demo
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTask, setNewTask] = useState("")

  // Fetch user, projects and tasks on component mount
  useEffect(() => {
    setUserId(currentUser.user_id)
    setProjects(mockProjects)
    setTasks(mockTasks)
    setLoading(false)
  }, [])

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(today, i))
  }, [today])

  // Filter tasks for selected date
  const selectedDateTasks = useMemo(() => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd")
    return tasks.filter((task) => task.due_date === formattedDate)
  }, [selectedDate, tasks])

  // Group tasks by time
  const groupedTasks = useMemo(() => {
    const withTime: Task[] = []
    const withoutTime: Task[] = []

    selectedDateTasks.forEach((task) => {
      if (task.due_time) {
        withTime.push(task)
      } else {
        withoutTime.push(task)
      }
    })

    // Sort tasks with time by time
    withTime.sort((a, b) => {
      if (!a.due_time || !b.due_time) return 0
      return a.due_time.localeCompare(b.due_time)
    })

    return { withTime, withoutTime }
  }, [selectedDateTasks])

  const addNewTask = () => {
    if (!newTask.trim()) return

    try {
      const task: Task = {
        task_id: getNextId(tasks),
        title: newTask,
        description: "",
        date_made: new Date().toISOString().split("T")[0],
        date_finished: undefined,
        due_date: format(selectedDate, "yyyy-MM-dd"),
        due_time: undefined,
        importance: 2, // Medium importance by default
        project_id: undefined,
        user_id: userId,
        finished: false,
      }

      setTasks([...tasks, task])
      setNewTask("")
    } catch (err) {
      console.error("Error adding task:", err)
      setError("Failed to add task. Please try again.")
    }
  }

  const toggleTaskCompletion = (taskId: number, currentStatus: boolean) => {
    try {
      const updatedTasks = tasks.map((task) => {
        if (task.task_id === taskId) {
          return {
            ...task,
            finished: !currentStatus,
            date_finished: !currentStatus ? new Date().toISOString().split("T")[0] : null,
          }
        }
        return task
      })

      setTasks(updatedTasks)
    } catch (err) {
      console.error("Error toggling task completion:", err)
      setError("Failed to update task. Please try again.")
    }
  }

  const deleteTask = (taskId: number) => {
    try {
      setTasks(tasks.filter((task) => task.task_id !== taskId))
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task. Please try again.")
    }
  }

  const getProjectColor = (projectId: number | null) => {
    if (!projectId) return "gray"
    const project = projects.find((p) => p.project_id === projectId)
    return project ? project.color : "gray"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Calendar header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold">Calendar</h2>
            <span className="text-muted-foreground ml-2">{format(selectedDate, "MMMM yyyy")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week days */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {weekDays.map((date) => (
            <Button
              key={date.toString()}
              variant="outline"
              className={cn(
                "flex-1 min-w-[100px] flex flex-col items-center py-2",
                isSameDay(date, selectedDate) && "border-primary bg-primary/10",
              )}
              onClick={() => setSelectedDate(date)}
            >
              <span className="text-xs text-muted-foreground">{format(date, "EEE")}</span>
              <span className="text-lg font-semibold">{format(date, "d")}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          {/* Time-based tasks */}
          <div className="mb-8">
            <h3 className="font-medium mb-4">Schedule</h3>

            {groupedTasks.withTime.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No scheduled tasks for this day</div>
            ) : (
              <div className="space-y-4">
                {groupedTasks.withTime.map((task) => (
                  <Card
                    key={task.task_id}
                    className={cn(
                      "border-l-4",
                      task.finished
                        ? "border-l-green-500"
                        : task.importance === 3
                          ? "border-l-red-500"
                          : task.importance === 2
                            ? "border-l-yellow-500"
                            : "border-l-blue-500",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`time-${task.task_id}`}
                          checked={task.finished}
                          onCheckedChange={() => toggleTaskCompletion(task.task_id, task.finished)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={`time-${task.task_id}`}
                              className={`block font-medium ${task.finished ? "line-through text-muted-foreground" : ""}`}
                            >
                              {task.title}
                            </label>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {task.due_time}
                            </div>
                          </div>

                          {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}

                          {task.project_id && (
                            <div className="flex items-center mt-2 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs`}
                                style={{
                                  backgroundColor: `${getColorHex(getProjectColor(task.project_id))}20`,
                                  color: getColorHex(getProjectColor(task.project_id)),
                                }}
                              >
                                {projects.find((p) => p.project_id === task.project_id)?.title || "Project"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Tasks without time */}
          <div>
            <h3 className="font-medium mb-4">Tasks</h3>

            <div className="space-y-3">
              {groupedTasks.withoutTime.map((task) => (
                <Card
                  key={task.task_id}
                  className={cn(
                    "border-l-4",
                    task.finished
                      ? "border-l-green-500"
                      : task.importance === 3
                        ? "border-l-red-500"
                        : task.importance === 2
                          ? "border-l-yellow-500"
                          : "border-l-blue-500",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`notime-${task.task_id}`}
                        checked={task.finished}
                        onCheckedChange={() => toggleTaskCompletion(task.task_id, task.finished)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={`notime-${task.task_id}`}
                            className={`block font-medium ${task.finished ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </label>
                        </div>

                        {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}

                        {task.project_id && (
                          <div className="flex items-center mt-2 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs`}
                              style={{
                                backgroundColor: `${getColorHex(getProjectColor(task.project_id))}20`,
                                color: getColorHex(getProjectColor(task.project_id)),
                              }}
                            >
                              {projects.find((p) => p.project_id === task.project_id)?.title || "Project"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center">
                <Input
                  placeholder="Add task"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addNewTask()
                    }
                  }}
                  className="border-none shadow-none focus-visible:ring-0 pl-0 h-auto py-2 text-muted-foreground"
                />
                <Button variant="ghost" size="sm" onClick={addNewTask} className="text-muted-foreground">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


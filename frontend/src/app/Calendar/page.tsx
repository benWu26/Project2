"use client"

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Calendar } from "@/components/calendar"
import { TasksView } from "@/components/tasks-view"
import { TaskDialog } from "@/components/task-dialog"
import type { Task } from "@/lib/types"
import { getTasksInRange } from "@/lib/api"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { AlertProvider } from "@/components/ui-alert-dialog"
import { useUser } from "@/hooks/UserContext"

// Temporary user ID for demo purposes
const DEMO_USER_ID = 1

export default function CalendarTasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const USER_ID = useUser().user?.user_id || DEMO_USER_ID

  // Fetch tasks for the current week
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true)
      try {
        const start = startOfWeek(selectedDate)
        const end = endOfWeek(selectedDate)
        const startFormatted = format(start, "yyyy-MM-dd")
        const endFormatted = format(end, "yyyy-MM-dd")

        const tasksData = await getTasksInRange(USER_ID, startFormatted, endFormatted)
        setTasks(tasksData)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [selectedDate])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEditTask = (task: Task) => {
    setCurrentTask(task)
    setIsDialogOpen(true)
  }

  const handleCreateTask = () => {
    setCurrentTask(null)
    setIsDialogOpen(true)
  }

  const handleTaskUpdated = (task: Task) => {
    setTasks((prevTasks) => {
      const index = prevTasks.findIndex((t) => t.task_id === task.task_id)
      if (index >= 0) {
        const newTasks = [...prevTasks]
        newTasks[index] = task
        return newTasks
      } else {
        return [...prevTasks, task]
      }
    })
    setIsDialogOpen(false)
    setCurrentTask(null)
  }

  return (
    <AlertProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <header className="bg-white border-b p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Task Calendar</h1>
              <button
                onClick={handleCreateTask}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Create Task
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-full mx-auto w-full p-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div
                className={`${isCalendarCollapsed ? "md:w-16" : "md:w-64"} transition-all duration-300 flex-shrink-0`}
              >
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  isCollapsed={isCalendarCollapsed}
                  onToggleCollapse={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
                />
              </div>
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <TasksView
                    tasks={tasks}
                    selectedDate={selectedDate}
                    userId={DEMO_USER_ID}
                    onEditTask={handleEditTask}
                    onTaskUpdated={handleTaskUpdated}
                  />
                )}
              </div>
            </div>
          </main>

          <TaskDialog
            isOpen={isDialogOpen}
            task={currentTask}
            userId={DEMO_USER_ID}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleTaskUpdated}
          />
        </div>
      </DndProvider>
    </AlertProvider>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

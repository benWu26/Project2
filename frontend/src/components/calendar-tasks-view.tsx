"use client"
/*
import type React from "react"

import { useMemo, useState } from "react"
import { format, isSameDay } from "date-fns"
import { Clock, CheckCircle, Circle, Edit, ChevronRight, GripVertical, ChevronLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDrag, useDrop } from "react-dnd"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TaskPreview } from "@/components/task-preview"
import { TaskDialog } from "@/components/task-dialog"

// Define the Task type for the calendar view
export interface CalendarTask {
  id: string
  title: string
  description: string
  dueDate: Date
  dueTime: string
  completed: boolean
  importance?: number
}

interface CalendarTasksViewProps {
  tasks: CalendarTask[]
  onEditTask: (task: CalendarTask) => void
  onToggleComplete: (taskId: string) => void
  onMoveTask: (taskId: string, newDate: Date, completed?: boolean) => void
}

// Define item types for drag and drop
const ItemTypes = {
  TASK: "task",
}

export function CalendarTasksView({ tasks, onEditTask, onToggleComplete, onMoveTask }: CalendarTasksViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<CalendarTask | null>(null)

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const weekDays = useMemo(() => {
    const today = new Date(selectedDate)
    today.setHours(0, 0, 0, 0)

    // Find the start of the week (Sunday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    // Generate array of 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })
  }, [selectedDate])

  const getTasksForDay = (date: Date) => {
    return tasks
      .filter((task) => {
        return isSameDay(task.dueDate, date)
      })
      .sort((a, b) => {
        // Sort by time
        return a.dueTime.localeCompare(b.dueTime)
      })
  }

  const handleEditTask = (task: CalendarTask) => {
    setCurrentTask(task)
    setIsDialogOpen(true)
  }

  const handleSaveTask = (task: CalendarTask) => {
    onEditTask(task)
    setIsDialogOpen(false)
    setCurrentTask(null)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col md:flex-row gap-2">
        <div className={`${isCalendarCollapsed ? "md:w-16" : "md:w-64"} transition-all duration-300 flex-shrink-0`}>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            isCollapsed={isCalendarCollapsed}
            onToggleCollapse={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
          />
        </div>
        <div className="flex-1">
          <Tabs defaultValue="week" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>

            <TabsContent value="week" className="space-y-2">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-center font-medium py-1 rounded-t-lg",
                      isSameDay(day, selectedDate) ? "bg-blue-100" : "bg-gray-100",
                    )}
                  >
                    <div className="text-xs text-gray-600">{dayNames[day.getDay()].substring(0, 3)}</div>
                    <div
                      className={cn(
                        "inline-flex items-center justify-center w-6 h-6 rounded-full",
                        isSameDay(day, selectedDate) ? "bg-blue-600 text-white" : "",
                      )}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, index) => {
                  const dayTasks = getTasksForDay(day)
                  const pendingTasks = dayTasks.filter((task) => !task.completed)
                  const completedTasks = dayTasks.filter((task) => task.completed)

                  return (
                    <DayColumn
                      key={index}
                      day={day}
                      pendingTasks={pendingTasks}
                      completedTasks={completedTasks}
                      onEditTask={handleEditTask}
                      onToggleComplete={onToggleComplete}
                      onMoveTask={onMoveTask}
                      isSelected={isSameDay(day, selectedDate)}
                    />
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="day">
              <div className="bg-white rounded-lg border p-4">
                <h2 className="text-xl font-bold mb-4">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>

                <div className="space-y-4">
                  {(() => {
                    const dayTasks = getTasksForDay(selectedDate)
                    const pendingTasks = dayTasks.filter((task) => !task.completed)
                    const completedTasks = dayTasks.filter((task) => task.completed)

                    return (
                      <>
                        <div>
                          <h3 className="font-medium text-gray-800 mb-2">Tasks</h3>
                          <TaskDropZone
                            day={selectedDate}
                            completed={false}
                            onMoveTask={onMoveTask}
                            className="min-h-[100px]"
                          >
                            {pendingTasks.length > 0 ? (
                              <div className="space-y-2">
                                {pendingTasks.map((task) => (
                                  <DraggableTaskItem
                                    key={task.id}
                                    task={task}
                                    onEdit={() => handleEditTask(task)}
                                    onToggleComplete={() => onToggleComplete(task.id)}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-400 py-4 text-center">No pending tasks for today</div>
                            )}
                          </TaskDropZone>
                        </div>

                        {completedTasks.length > 0 && (
                          <div>
                            <h3 className="font-medium text-gray-800 mb-2">Completed</h3>
                            <TaskDropZone
                              day={selectedDate}
                              completed={true}
                              onMoveTask={onMoveTask}
                              className="min-h-[50px]"
                            >
                              <div className="space-y-2">
                                {completedTasks.map((task) => (
                                  <DraggableTaskItem
                                    key={task.id}
                                    task={task}
                                    onEdit={() => handleEditTask(task)}
                                    onToggleComplete={() => onToggleComplete(task.id)}
                                  />
                                ))}
                              </div>
                            </TaskDropZone>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {currentTask && (
        <TaskDialog
          isOpen={isDialogOpen}
          task={currentTask}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </DndProvider>
  )
}

interface DayColumnProps {
  day: Date
  pendingTasks: CalendarTask[]
  completedTasks: CalendarTask[]
  onEditTask: (task: CalendarTask) => void
  onToggleComplete: (taskId: string) => void
  onMoveTask: (taskId: string, newDate: Date, completed?: boolean) => void
  isSelected: boolean
}

function DayColumn({
  day,
  pendingTasks,
  completedTasks,
  onEditTask,
  onToggleComplete,
  onMoveTask,
  isSelected,
}: DayColumnProps) {
  return (
    <div
      className={cn(
        "min-h-[calc(80vh-120px)] bg-white rounded-b-lg border p-1 flex flex-col",
        isSelected ? "border-blue-200 shadow-sm" : "border-gray-200",
      )}
    >
      <TaskDropZone day={day} completed={false} onMoveTask={onMoveTask} className="flex-1">
        {pendingTasks.length > 0 ? (
          <div className="space-y-1">
            {pendingTasks.map((task) => (
              <DraggableTaskItem
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onToggleComplete={() => onToggleComplete(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">No tasks</div>
        )}
      </TaskDropZone>

      {completedTasks.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mb-1">COMPLETED</h4>
          <TaskDropZone day={day} completed={true} onMoveTask={onMoveTask}>
            <div className="space-y-1">
              {completedTasks.map((task) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onToggleComplete={() => onToggleComplete(task.id)}
                />
              ))}
            </div>
          </TaskDropZone>
        </div>
      )}
    </div>
  )
}

interface TaskDropZoneProps {
  day: Date
  completed: boolean
  onMoveTask: (taskId: string, newDate: Date, completed?: boolean) => void
  children: React.ReactNode
  className?: string
}

function TaskDropZone({ day, completed, onMoveTask, children, className = "" }: TaskDropZoneProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      onMoveTask(item.id, day, completed)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  return (
    <div ref={drop} className={cn("transition-colors", isOver ? "bg-blue-50" : "", className)}>
      {children}
    </div>
  )
}

interface DraggableTaskItemProps {
  task: CalendarTask
  onEdit: () => void
  onToggleComplete: () => void
}

function DraggableTaskItem({ task, onEdit, onToggleComplete }: DraggableTaskItemProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPreviewPosition({
      x: rect.right + 10,
      y: rect.top,
    })
    setShowPreview(true)
  }

  const handleMouseLeave = () => {
    setShowPreview(false)
  }

  const getPriorityColor = (importance?: number) => {
    if (!importance) return ""
    switch (importance) {
      case 1:
        return "border-l-4 border-blue-400"
      case 2:
        return "border-l-4 border-yellow-400"
      case 3:
        return "border-l-4 border-red-400"
      default:
        return ""
    }
  }

  return (
    <>
      <div
        ref={preview}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className={cn(
          "p-1.5 rounded text-sm flex items-start gap-1.5 group hover:bg-gray-50 border border-gray-100 cursor-move",
          task.completed ? "text-gray-500 bg-gray-50" : "bg-white",
          getPriorityColor(task.importance),
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button onClick={onToggleComplete} className="mt-0.5 flex-shrink-0">
          {task.completed ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className={cn("font-medium text-sm truncate", task.completed ? "line-through" : "")}>{task.title}</div>
          {task.dueTime && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-0.5" />
              {formatTime(task.dueTime)}
            </div>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="text-xs text-gray-500">
              <span>
                {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <Edit className="h-3.5 w-3.5" />
          </button>
          <div ref={drag} className="cursor-grab text-gray-400 hover:text-gray-600">
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {showPreview && <TaskPreview task={task} position={previewPosition} />}
    </>
  )
}

function Calendar({
  selectedDate,
  onSelectDate,
  isCollapsed,
  onToggleCollapse,
}: {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col">
      <div className="flex items-center justify-between p-3">
        {!isCollapsed ? (
          <>
            <h2 className="font-semibold text-lg">
              {monthName} {year}
            </h2>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full text-center">
            <span className="text-sm font-medium">{format(selectedDate, "MMM d")}</span>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-3 pb-2">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-1 mt-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    onClick={() => onSelectDate(day)}
                    className={cn(
                      "w-full h-full flex items-center justify-center rounded-full text-sm",
                      isToday(day) && "font-bold",
                      isSelected(day) ? "bg-blue-600 text-white" : "hover:bg-gray-100",
                    )}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto border-t p-2 flex justify-center">
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="w-full">
          {isCollapsed ? (
            <>
              <ChevronRight className="h-4 w-4 mr-1" />
              <span className="text-xs">Expand</span>
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":").map(Number)
  return format(new Date().setHours(hours, minutes), "h:mm a")
}
*/
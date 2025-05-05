"use client"

import type React from "react"
import { useMemo, useRef, useState } from "react"
import { format, isSameDay, parseISO } from "date-fns"
import type { Task } from "@/lib/types"
import { Clock, CheckCircle, Circle, Edit, GripVertical } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useDrag, useDrop } from "react-dnd"
import { TaskPreview } from "@/components/task-preview"
import { updateTask } from "@/lib/api"

interface TasksViewProps {
  tasks: Task[]
  selectedDate: Date
  userId: number
  onEditTask: (task: Task) => void
  onTaskUpdated: (task: Task) => void
}

// Define item types for drag and drop
const ItemTypes = {
  TASK: "task",
}

export function TasksView({ tasks, selectedDate, onEditTask, onTaskUpdated }: TasksViewProps) {
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
        const taskDate = parseISO(task.due_date)
        return isSameDay(taskDate, date)
      })
      .sort((a, b) => {
        // Sort by time
        return (a.due_time || "").localeCompare(b.due_time || "")
      })
  }

  const handleToggleComplete = async (taskId: number) => {
    const task = tasks.find((t) => t.task_id === taskId)
    if (!task) return

    try {
      const updatedTask = await updateTask(taskId, {
        finished: !task.finished,
      })
      onTaskUpdated(updatedTask)
    } catch (error) {
      console.error("Error toggling task completion:", error)
    }
  }

  const handleMoveTask = async (taskId: number, newDate: Date, finished?: boolean) => {
    const task = tasks.find((t) => t.task_id === taskId)
    if (!task) return

    try {
      const updatedTask = await updateTask(taskId, {
        due_date: format(newDate, "yyyy-MM-dd"),
        finished: finished !== undefined ? finished : task.finished,
      })
      onTaskUpdated(updatedTask)
    } catch (error) {
      console.error("Error moving task:", error)
    }
  }

  return (
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
            const pendingTasks = dayTasks.filter((task) => !task.finished)
            const completedTasks = dayTasks.filter((task) => task.finished)

            return (
              <DayColumn
                key={index}
                day={day}
                pendingTasks={pendingTasks}
                completedTasks={completedTasks}
                onEditTask={onEditTask}
                onToggleComplete={handleToggleComplete}
                onMoveTask={handleMoveTask}
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
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Tasks</h3>
              <TaskDropZone day={selectedDate} completed={false} onMoveTask={handleMoveTask} className="min-h-[100px]">
                {(() => {
                  const dayTasks = getTasksForDay(selectedDate)
                  const pendingTasks = dayTasks.filter((task) => !task.finished)
                  //const completedTasks = dayTasks.filter((task) => task.finished)

                  return (
                    <>
                      {pendingTasks.length > 0 ? (
                        <div className="space-y-2">
                          {pendingTasks.map((task) => (
                            <DraggableTaskItem
                              key={task.task_id}
                              task={task}
                              onEdit={() => onEditTask(task)}
                              onToggleComplete={() => handleToggleComplete(task.task_id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 py-4 text-center">No pending tasks for today</div>
                      )}
                    </>
                  )
                })()}
              </TaskDropZone>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Completed</h3>
              <TaskDropZone day={selectedDate} completed={true} onMoveTask={handleMoveTask} className="min-h-[50px]">
                {(() => {
                  const dayTasks = getTasksForDay(selectedDate)
                  //const pendingTasks = dayTasks.filter((task) => !task.finished)
                  const completedTasks = dayTasks.filter((task) => task.finished)

                  return (
                    <>
                      {completedTasks.length > 0 ? (
                        <div className="space-y-2">
                          {completedTasks.map((task) => (
                            <DraggableTaskItem
                              key={task.task_id}
                              task={task}
                              onEdit={() => onEditTask(task)}
                              onToggleComplete={() => handleToggleComplete(task.task_id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 py-2 text-center">Drag tasks here to complete</div>
                      )}
                    </>
                  )
                })()}
              </TaskDropZone>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

interface DayColumnProps {
  day: Date
  pendingTasks: Task[]
  completedTasks: Task[]
  onEditTask: (task: Task) => void
  onToggleComplete: (taskId: number) => void
  onMoveTask: (taskId: number, newDate: Date, completed?: boolean) => void
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
                key={task.task_id}
                task={task}
                onEdit={() => onEditTask(task)}
                onToggleComplete={() => onToggleComplete(task.task_id)}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">No tasks</div>
        )}
      </TaskDropZone>

      {/* Always show the completed section */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-medium text-gray-500 mb-1">COMPLETED</h4>
        <TaskDropZone day={day} completed={true} onMoveTask={onMoveTask} className="min-h-[40px]">
          {completedTasks.length > 0 ? (
            <div className="space-y-1">
              {completedTasks.map((task) => (
                <DraggableTaskItem
                  key={task.task_id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onToggleComplete={() => onToggleComplete(task.task_id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-xs text-center py-2">Drag tasks here to complete</div>
          )}
        </TaskDropZone>
      </div>
    </div>
  )
}

interface TaskDropZoneProps {
  day: Date
  completed: boolean
  onMoveTask: (taskId: number, newDate: Date, completed?: boolean) => void
  children: React.ReactNode
  className?: string
}

function TaskDropZone({ day, completed, onMoveTask, children, className = "" }: TaskDropZoneProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: number }) => {
      onMoveTask(item.id, day, completed)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })
  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  return (


    <div ref={dropRef} className={cn("transition-colors", isOver ? "bg-blue-50" : "", className)}>
      {children}
    </div>
  )
}

interface DraggableTaskItemProps {
  task: Task
  onEdit: () => void
  onToggleComplete: () => void
}

function DraggableTaskItem({ task, onEdit, onToggleComplete }: DraggableTaskItemProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.task_id },
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

  return (
    <>
      <div
        ref={(el) => {
          preview(el as HTMLDivElement);
        }}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className={cn(
          "p-1.5 rounded text-sm flex items-start gap-1.5 group hover:bg-gray-50 border border-gray-100 cursor-move",
          task.finished ? "text-gray-500 bg-gray-50" : "bg-white",
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button onClick={onToggleComplete} className="mt-0.5 flex-shrink-0">
          {task.finished ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className={cn("font-medium text-sm truncate", task.finished ? "line-through" : "")}>{task.title}</div>
          {task.due_time && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-0.5" />
              {formatTime(task.due_time)}
            </div>
          )}
          {task.importance && (
            <div className="text-xs text-gray-500">
              <span>Priority: {task.importance === 1 ? "Low" : task.importance === 2 ? "Medium" : "High"}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <Edit className="h-3.5 w-3.5" />
          </button>
          <div ref={(el) => { if (el) drag(el); }} className="cursor-grab text-gray-400 hover:text-gray-600">
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {showPreview && <TaskPreview task={task} position={previewPosition} />}
    </>
  )
}

function formatTime(timeString: string | undefined) {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":").map(Number)
  return format(new Date().setHours(hours, minutes), "h:mm a")
}

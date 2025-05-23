"use client"

/*import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import TaskList from "@/components/task-list"
import TaskForm from "@/components/task-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/UserContext"
import { createTask, deleteTask, getTasksByUser, updateTask } from "@/lib/api"

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, we'll use a hardcoded user ID
  const user = useUser()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await getTasksByUser(user.user?.user_id || 1)
      console.log("Tasks loaded:", response)
      setTasks(response)
      setError(null)
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError("Failed to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (newTask: Omit<Task, "task_id">) => {
    try {
      const response = await createTask(newTask)
      console.log("Task created:", response)
      setTasks([...tasks, response])
    } catch (err) {
      console.error("Error creating task:", err)
      setError("Failed to create task. Please try again.")
    }
  }

  const handleUpdateTask = async (taskId: number, updatedTask: Partial<Task>) => {
    try {
      const response = await updateTask(taskId, updatedTask)
      console.log("Task updated:", response)
      setTasks(tasks.map((task) => (task.task_id === taskId ? { ...task, ...response } : task)))
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task. Please try again.")
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      console.log("Task deleted:", taskId)
      setTasks(tasks.filter((task) => task.task_id !== taskId))
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task. Please try again.")
    }
  }

  const handleToggleComplete = async (task: Task) => {
    const updatedTask = {
      ...task,
      finished: !task.finished,
      date_finished: !task.finished ? new Date().toISOString() : undefined,
    }
    await handleUpdateTask(task.task_id, updatedTask)
  }

  const activeTasks = tasks.filter((task) => !task.finished)
  const completedTasks = tasks.filter((task) => task.finished)

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Task Manager</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage your tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
                <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {loading ? (
                  <p>Loading tasks...</p>
                ) : activeTasks.length > 0 ? (
                  <TaskList
                    tasks={activeTasks}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTask}
                  />
                ) : (
                  <p>No active tasks. Create a new task to get started!</p>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {loading ? (
                  <p>Loading tasks...</p>
                ) : completedTasks.length > 0 ? (
                  <TaskList
                    tasks={completedTasks}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTask}
                  />
                ) : (
                  <p>No completed tasks yet.</p>
                )}
              </TabsContent>

              <TabsContent value="all">
                {loading ? (
                  <p>Loading tasks...</p>
                ) : tasks.length > 0 ? (
                  <TaskList
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTask}
                  />
                ) : (
                  <p>No tasks found. Create a new task to get started!</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>Create a new task</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskForm userId={user.user?.user_id || 1} onCreateTask={handleCreateTask} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

*/

import { Suspense } from "react"
import TaskDashboard from "@/components/task-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/hooks/UserContext"

export default function Home() {
  // In a real app, you would get the user_id from authentication
  const user = useUser()
  const defaultUserId = user.user?.user_id || 1

  return (
    <main className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Task Manager</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <TaskDashboard userId={defaultUserId} />
      </Suspense>
    </main>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
      </div>
    </div>
  )
}

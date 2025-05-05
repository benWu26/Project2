"use client"
/*
import { useState, useEffect } from "react"
import { Calendar, ChevronDown, Clock, Filter, Flag, Inbox, Menu, Plus, Star, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { format, parseISO } from "date-fns"

export default function TodoView() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userId, setUserId] = useState<number>(1) // Default to 1 for demo
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newTaskText, setNewTaskText] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("inbox")
  const [sortBy, setSortBy] = useState<string>("date")
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectColor, setNewProjectColor] = useState("blue")

  // Fetch user, projects and tasks on component mount
  useEffect(() => {
    setUserId(currentUser.user_id)
    setProjects(mockProjects)
    setTasks(mockTasks)
    setLoading(false)
  }, [])

  // Filter tasks based on selected project
  const filteredTasks = tasks.filter((task) => {
    if (selectedProject === "inbox") {
      return true // Show all tasks in inbox
    }
    return task.project_id === Number.parseInt(selectedProject)
  })

  // Sort tasks based on selected sort option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    } else if (sortBy === "importance") {
      const aImportance = a.importance || 0
      const bImportance = b.importance || 0
      return bImportance - aImportance // Higher importance first
    } else if (sortBy === "recent") {
      return new Date(b.date_made).getTime() - new Date(a.date_made).getTime()
    }
    return 0
  })

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

  const addTask = () => {
    if (!newTaskText.trim()) return

    try {
      const newTask: Task = {
        task_id: getNextId(tasks),
        title: newTaskText,
        description: "",
        date_made: new Date().toISOString().split("T")[0],
        date_finished: undefined,
        due_date: new Date().toISOString().split("T")[0],
        due_time: undefined,
        importance: 2, // Medium importance by default
        project_id: selectedProject === "inbox" ? undefined : Number.parseInt(selectedProject),
        user_id: userId,
        finished: false,
      }

      setTasks([...tasks, newTask])
      setNewTaskText("")

      // Open dialog to edit the new task
      setEditingTask(newTask)
      setIsDialogOpen(true)
    } catch (err) {
      console.error("Error adding task:", err)
      setError("Failed to add task. Please try again.")
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

  const updateTask = (updatedTask: Task) => {
    try {
      setTasks(tasks.map((task) => (task.task_id === updatedTask.task_id ? updatedTask : task)))
      setEditingTask(null)
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task. Please try again.")
    }
  }

  const openTaskDialog = (task: Task) => {
    setEditingTask({ ...task })
    setIsDialogOpen(true)
  }

  const addProject = () => {
    if (!newProjectName.trim()) return

    try {
      const newProject: Project = {
        project_id: getNextId(projects),
        title: newProjectName,
        user_id: userId,
        color: newProjectColor,
      }

      setProjects([...projects, newProject])
      setNewProjectName("")
      setIsAddingProject(false)
    } catch (err) {
      console.error("Error adding project:", err)
      setError("Failed to add project. Please try again.")
    }
  }

  const getProjectColor = (projectId: number | null) => {
    if (!projectId) return "gray"
    const project = projects.find((p) => p.project_id === projectId)
    return project ? project.color : "gray"
  }

  const formatDate = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

    if (dateString === today) return "Today"
    if (dateString === tomorrow) return "Tomorrow"

    return format(parseISO(dateString), "MMM d, yyyy")
  }

  // Convert importance number to text
  const importanceToText = (importance: number | null): "low" | "medium" | "high" => {
    if (!importance) return "low"
    if (importance === 1) return "low"
    if (importance === 2) return "medium"
    return "high"
  }

  // Convert text to importance number
  const textToImportance = (text: string): number => {
    if (text === "low") return 1
    if (text === "medium") return 2
    return 3
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
    <div className="flex h-full">
      {/* Sidebar }
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0 md:w-16"
        } transition-all duration-300 ease-in-out overflow-hidden border-r h-full`}
      >
        <div className="h-full flex flex-col p-2">
          <div className="flex items-center justify-between mb-4 px-2">
            {sidebarOpen && <h2 className="font-semibold">Tasks</h2>}
            {sidebarOpen && (
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start mb-1",
                selectedProject === "inbox" ? "bg-muted" : "hover:bg-muted/50",
                !sidebarOpen ? "px-2" : "px-3",
              )}
              onClick={() => setSelectedProject("inbox")}
            >
              <Inbox className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">Inbox</span>}
            </Button>

            <Button
              variant="ghost"
              className={cn("w-full justify-start mb-1", !sidebarOpen ? "px-2" : "px-3")}
              onClick={() => {}}
            >
              <Calendar className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">Calendar</span>}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("w-full justify-start mb-1", !sidebarOpen ? "px-2" : "px-3")}>
                  <Filter className="h-4 w-4" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-2">Sort by</span>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due Date</span>
                  {sortBy === "date" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("importance")}>
                  <Flag className="h-4 w-4 mr-2" />
                  <span>Importance</span>
                  {sortBy === "importance" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Recently Added</span>
                  {sortBy === "recent" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Projects section }
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              {sidebarOpen && <span className="text-xs font-medium text-muted-foreground">PROJECTS</span>}
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsAddingProject(true)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Project list }
            <ScrollArea className="h-40">
              <div className="pr-2">
                {projects.map((project) => (
                  <Button
                    key={project.project_id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start mb-1",
                      selectedProject === project.project_id.toString() ? "bg-muted" : "hover:bg-muted/50",
                      !sidebarOpen ? "px-2" : "px-3",
                    )}
                    onClick={() => setSelectedProject(project.project_id.toString())}
                  >
                    <div
                      className={`h-3 w-3 rounded-full mr-2`}
                      style={{ backgroundColor: getColorHex(project.color) }}
                    />
                    {sidebarOpen && <span>{project.title}</span>}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Add project input 
            {isAddingProject && (
              <div className="px-3 mt-2">
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  className="mb-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addProject()
                    } else if (e.key === "Escape") {
                      setIsAddingProject(false)
                      setNewProjectName("")
                    }
                  }}
                  autoFocus
                />
                <Select value={newProjectColor} onValueChange={setNewProjectColor}>
                  <SelectTrigger className="mb-1">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsAddingProject(false)
                      setNewProjectName("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="w-full" onClick={addProject}>
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content }
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header }
        <header className="border-b p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <div>
            <h1 className="text-xl font-bold">
              {selectedProject === "inbox"
                ? "Inbox"
                : projects.find((p) => p.project_id.toString() === selectedProject)?.title || "Tasks"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>

          <div className="ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Due Date</SelectItem>
                <SelectItem value="importance">Importance</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Task list }
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {sortedTasks.map((task) => (
              <Card key={task.task_id} className={cn("overflow-hidden", task.finished ? "opacity-70" : "")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={task.task_id.toString()}
                      checked={task.finished}
                      onCheckedChange={() => toggleTaskCompletion(task.task_id, task.finished)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={task.task_id.toString()}
                          className={`block font-medium ${task.finished ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.title}
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.task_id)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center mt-2 text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(task.due_date)}
                        </div>
                        {task.due_time && (
                          <div className="flex items-center text-muted-foreground ml-3">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.due_time}
                          </div>
                        )}
                        {task.project_id && (
                          <div
                            className="flex items-center ml-3 px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: `${getColorHex(getProjectColor(task.project_id))}20`,
                              color: getColorHex(getProjectColor(task.project_id)),
                            }}
                          >
                            {projects.find((p) => p.project_id === task.project_id)?.title}
                          </div>
                        )}
                        <div className="ml-auto flex items-center">
                          {task.importance === 3 && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                          {task.importance === 2 && (
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 opacity-50" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full mt-2 text-xs text-muted-foreground"
                    onClick={() => openTaskDialog(task)}
                  >
                    Edit details
                  </Button>
                </CardContent>
              </Card>
            ))}

            {sortedTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tasks found</p>
                <p className="text-sm mt-1">Add a new task to get started</p>
              </div>
            )}

            {/* Add task input }
            <div className="flex items-center bg-muted/30 rounded-lg p-2">
              <Checkbox className="mr-3 opacity-50" disabled />
              <Input
                placeholder="Add a task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask()
                  }
                }}
                className="border-none shadow-none focus-visible:ring-0 bg-transparent"
              />
              <Button variant="ghost" size="sm" onClick={addTask} className="text-muted-foreground">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Edit Dialog }
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the details of your task.</DialogDescription>
          </DialogHeader>

          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Due Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingTask.due_date}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="time">Time (optional)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={editingTask.due_time || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        due_time: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={editingTask.project_id?.toString() || ""}
                    onValueChange={(value) =>
                      setEditingTask({
                        ...editingTask,
                        project_id: value ? Number.parseInt(value) : undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.project_id} value={project.project_id.toString()}>
                          <div className="flex items-center">
                            <div
                              className="h-2 w-2 rounded-full mr-2"
                              style={{ backgroundColor: getColorHex(project.color) }}
                            />
                            {project.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="importance">Importance</Label>
                  <Select
                    value={importanceToText(editingTask.importance)}
                    onValueChange={(value: any) =>
                      setEditingTask({
                        ...editingTask,
                        importance: textToImportance(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select importance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state">Completed</Label>
                <Checkbox
                  id="state"
                  checked={editingTask.finished}
                  onCheckedChange={(checked) =>
                    setEditingTask({
                      ...editingTask,
                      finished: checked === true,
                      date_finished: checked === true ? new Date().toISOString().split("T")[0] : undefined,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => editingTask && updateTask(editingTask)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

*/
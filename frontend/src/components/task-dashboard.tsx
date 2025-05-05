"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns"
import { Search, Filter, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import TaskList from "@/components/task-list"
import TaskForm from "@/components/task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Task } from "@/lib/types"
import { getTasksByUser, cleanupOldTasks, getTasksInRange } from "@/lib/api"
import { useAlert } from "@/components/ui-alert-dialog"

export default function TaskDashboard({ userId }: { userId: number }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [importance, setImportance] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState<string>("due_date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const { showConfirm } = useAlert()

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [userId])

  // Apply filters when tasks, search query, or importance changes
  useEffect(() => {
    applyFilters()
  }, [tasks, searchQuery, importance, dateRange, activeTab, sortBy, sortDirection])

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const fetchedTasks = await getTasksByUser(userId)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /*const fetchFilteredTasks = async (targetDate: string, finished: boolean) => {
    setIsLoading(true)
    try {
      const fetchedTasks = await getFilteredTasks(userId, targetDate, finished)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error fetching filtered tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }*/

  const fetchTasksInRange = async () => {
    if (dateRange?.from && dateRange?.to) {
      setIsLoading(true)
      try {
        const startDate = format(dateRange.from, "yyyy-MM-dd")
        const endDate = format(dateRange.to, "yyyy-MM-dd")
        const fetchedTasks = await getTasksInRange(userId, startDate, endDate)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Error fetching tasks in range:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCleanupOldTasks = async (days: number) => {
    const confirmed = await showConfirm(
      "Confirm Deletion",
      `Are you sure you want to delete tasks older than ${days} days?`,
    )

    if (confirmed) {
      try {
        await cleanupOldTasks(userId, days)
        fetchTasks()
      } catch (error) {
        console.error("Error cleaning up old tasks:", error)
      }
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Filter by tab (all, active, completed)
    if (activeTab === "active") {
      filtered = filtered.filter((task) => !task.finished)
    } else if (activeTab === "completed") {
      filtered = filtered.filter((task) => task.finished)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      )
    }

    // Filter by importance
    if (importance !== "all") {
      const importanceValue = Number.parseInt(importance)
      filtered = filtered.filter((task) => task.importance === importanceValue)
    }

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((task) => {
        const taskDate = parseISO(task.due_date)
        return (
          (dateRange.from && (isAfter(taskDate, dateRange.from) || isEqual(taskDate, dateRange.from))) &&
          (dateRange.to && (isBefore(taskDate, dateRange.to) || isEqual(taskDate, dateRange.to)))
        )
      })
    }

    // Sort tasks
    if (sortBy) {
      filtered.sort((a, b) => {
        let valueA: string | number | Date
        let valueB: string | number | Date

        // Get values based on sort field
        if (sortBy === "due_date") {
          valueA = new Date(a.due_date)
          valueB = new Date(b.due_date)
        } else if (sortBy === "title") {
          valueA = a.title.toLowerCase()
          valueB = b.title.toLowerCase()
        } else if (sortBy === "importance") {
          valueA = a.importance || 0
          valueB = b.importance || 0
        } else {
          return 0
        }

        // Compare values based on direction
        if (sortDirection === "asc") {
          if (valueA < valueB) return -1
          if (valueA > valueB) return 1
          return 0
        } else {
          if (valueA > valueB) return -1
          if (valueA < valueB) return 1
          return 0
        }
      })
    }

    setFilteredTasks(filtered)
  }

  const handleTaskAdded = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask])
    setIsFormOpen(false)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.task_id === updatedTask.task_id ? updatedTask : task)))
  }

  const handleTaskDeleted = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => task.task_id !== taskId))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                Sort: {sortBy === "due_date" ? "Due Date" : sortBy === "title" ? "Title" : "Importance"}
                {sortDirection === "asc" ? " ↑" : " ↓"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Sort Tasks</h4>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={sortBy === "due_date" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSortBy("due_date")
                        applyFilters()
                      }}
                    >
                      Due Date
                    </Button>
                    <Button
                      variant={sortBy === "title" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSortBy("title")
                        applyFilters()
                      }}
                    >
                      Title
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={sortBy === "importance" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSortBy("importance")
                        applyFilters()
                      }}
                    >
                      Importance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        applyFilters()
                      }}
                    >
                      {sortDirection === "asc" ? "Ascending ↑" : "Descending ↓"}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm userId={userId} onTaskAdded={handleTaskAdded} />
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Importance</h4>
                  <Select value={importance} onValueChange={setImportance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by importance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1">Low</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Date Range</h4>
                  <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Sort By</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due_date">Due Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="importance">Importance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as "asc" | "desc")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImportance("all")
                      setDateRange(undefined)
                      setSearchQuery("")
                      setSortBy("due_date")
                      setSortDirection("asc")
                      fetchTasks()
                    }}
                  >
                    Reset
                  </Button>
                  <Button size="sm" onClick={fetchTasksInRange} disabled={!dateRange?.from || !dateRange?.to}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <Trash2 className="mr-2 h-4 w-4" /> Cleanup
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Delete old tasks</h4>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCleanupOldTasks(7)}>
                    Older than 7 days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCleanupOldTasks(30)}>
                    Older than 30 days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCleanupOldTasks(90)}>
                    Older than 90 days
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TaskList
            tasks={filteredTasks}
            isLoading={isLoading}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <TaskList
            tasks={filteredTasks}
            isLoading={isLoading}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <TaskList
            tasks={filteredTasks}
            isLoading={isLoading}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

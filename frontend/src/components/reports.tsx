/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, FileBarChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/UserContext"
import { getTaskCompletionReport, getNoteActivityReport } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"

export default function ReportsPage() {
  const { user } = useUser()
  const [reportType, setReportType] = useState<"tasks" | "notes">("tasks")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [showCompleted, setShowCompleted] = useState<boolean | undefined>(undefined)
  const [importance, setImportance] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [taskReport, setTaskReport] = useState<any>(null)
  const [noteReport, setNoteReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Also update the generateReport function to handle the different response structure
  const generateReport = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")

      if (reportType === "tasks") {
        const report = await getTaskCompletionReport(user?.user_id || 1, startDate, endDate, showCompleted, importance ?? 0)
        console.log("Task report data:", report) // Log the response to see its structure
        setTaskReport(report)
        setNoteReport(null)
      } else {
        const report = await getNoteActivityReport(user?.user_id || 1, startDate, endDate)
        console.log("Note report data:", report) // Log the response to see its structure
        setNoteReport(report)
        setTaskReport(null)
      }
    } catch (err) {
      console.error("Error generating report:", err)
      setError("Failed to generate report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  //const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

  const formatDateForDisplay = (date: Date) => {
    return format(date, "PPP")
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl overflow-auto">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Configure your report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Tabs defaultValue="tasks" onValueChange={(value) => setReportType(value as "tasks" | "notes")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tasks">Task Completion</TabsTrigger>
                    <TabsTrigger value="notes">Note Activity</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? formatDateForDisplay(dateRange.from) : <span>From date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? formatDateForDisplay(dateRange.to) : <span>To date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {reportType === "tasks" && (
                <>
                  <div className="space-y-2">
                    <Label>Task Status</Label>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={showCompleted === undefined ? "all" : showCompleted ? "completed" : "pending"}
                        onValueChange={(value) => {
                          if (value === "all") setShowCompleted(undefined)
                          else if (value === "completed") setShowCompleted(true)
                          else setShowCompleted(false)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tasks</SelectItem>
                          <SelectItem value="completed">Completed Only</SelectItem>
                          <SelectItem value="pending">Pending Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select
                      value={importance === undefined ? "all" : importance.toString()}
                      onValueChange={(value) => {
                        if (value === "all") setImportance(undefined)
                        else setImportance(Number.parseInt(value))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="1">Low</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button onClick={generateReport} className="w-full" disabled={isLoading}>
                <FileBarChart className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{reportType === "tasks" ? "Task Completion Report" : "Note Activity Report"}</CardTitle>
              <CardDescription>
                {dateRange.from && dateRange.to
                  ? `${formatDateForDisplay(dateRange.from)} to ${formatDateForDisplay(dateRange.to)}`
                  : "Select a date range to generate a report"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-120px)] overflow-auto">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[300px] w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                </div>
              ) : reportType === "tasks" && taskReport ? (
                <TaskCompletionReportView report={taskReport} />
              ) : reportType === "notes" && noteReport ? (
                <NoteActivityReportView report={noteReport} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <FileBarChart className="h-16 w-16 mb-4" />
                  <p>Select your report parameters and click "Generate Report" to view your data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


function TaskCompletionReportView({ report }: { report: any }) {
  // Handle the actual API response structure
  const totalTasks = report.total_tasks || 0
  const completedTasks = report.completed_tasks || 0
  const pendingTasks = totalTasks - completedTasks
  const completionRate = report.completion_rate || 0
  const avgImportance = report.avg_importance || 0

  // Create data for charts
  const completionRateData = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: pendingTasks },
  ]

  // Create mock data for priority chart if not available
  const completionByPriorityData = [{ name: "Average Priority", value: avgImportance }]

  //const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

  return (
    <div className="space-y-6 overflow-auto">
      <div>
        <h3 className="text-lg font-medium mb-2">Overall Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">{pendingTasks}</div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Completion Rate</h3>
        <div className="h-[300px] min-h-[300px]">
          {completionRateData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {completionRateData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#f59e0b"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No completion data available for this period
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Completion Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{(completionRate * 100).toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{avgImportance.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Average Priority</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Average Task Priority</h3>
        <div className="h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionByPriorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 3]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Priority Level" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// Update the NoteActivityReportView function to be more resilient to different response structures
function NoteActivityReportView({ report }: { report: any }) {
  console.log("Note report structure:", report)

  // Extract data with fallbacks for different API structures
  const totalNotes = report.overall_stats?.total_notes || report.total_notes || 0
  //const createdInPeriod = report.overall_stats?.created_in_period || report.created_in_period || 0
  //const updatedInPeriod = report.overall_stats?.updated_in_period || report.updated_in_period || 0

  // Format data for charts - handle both possible structures
  const activityByDateData = report.activity_by_date
    ? report.activity_by_date.map((item: any) => ({
        date: format(new Date(item.date), "MMM d"),
        created: item.created_count,
        updated: item.updated_count,
      }))
    : []

  const noteLengthData = report.note_length_distribution
    ? report.note_length_distribution.map((item: any) => ({
        category: item.category,
        count: item.count,
      }))
    : []

  return (
    <div className="space-y-6 overflow-auto">
      <div>
        <h3 className="text-lg font-medium mb-2">Overall Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalNotes}</div>
              <p className="text-sm text-muted-foreground">Total Notes</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {activityByDateData.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Activity by Date</h3>
          <div className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityByDateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" name="Created" stroke="#3b82f6" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="updated" name="Updated" stroke="#8b5cf6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {noteLengthData.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Note Length Distribution</h3>
          <div className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={noteLengthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Notes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activityByDateData.length === 0 && noteLengthData.length === 0 && (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No detailed note activity data available for this period
        </div>
      )}
    </div>
  )
}

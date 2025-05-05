"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface CalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Calendar({ selectedDate, onSelectDate, isCollapsed, onToggleCollapse }: CalendarProps) {
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

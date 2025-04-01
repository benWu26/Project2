import type { User, Task, Project, Note } from "../types"

// Current user
export const currentUser: User = {
  user_id: 1,
  name: "Demo User",
  email: "demo@example.com",
}

// Mock tasks
export const mockTasks: Task[] = [
  {
    task_id: 1,
    title: "Create Experimentalist Newsletter assets",
    description: "Design and prepare all assets for the monthly newsletter",
    date_made: "2025-03-30",
    date_finished: undefined,
    due_date: "2025-03-31",
    due_time: "10:00",
    importance: 3,
    project_id: 1,
    user_id: 1,
    finished: false,
  },
  {
    task_id: 2,
    title: "Reply to babysitter",
    description: "Confirm availability for next weekend",
    date_made: "2025-03-30",
    date_finished: undefined,
    due_date: "2025-03-31",
    due_time: "14:00",
    importance: 2,
    project_id: 2,
    user_id: 1,
    finished: false,
  },
  {
    task_id: 3,
    title: "Send contract to client",
    description: "Review and send the final contract to the new client",
    date_made: "2025-03-29",
    date_finished: undefined,
    due_date: "2025-03-31",
    due_time: undefined,
    importance: 3,
    project_id: 1,
    user_id: 1,
    finished: false,
  },
  {
    task_id: 4,
    title: "Call Pam",
    description: "Discuss weekend plans",
    date_made: "2025-03-29",
    date_finished: undefined,
    due_date: "2025-03-31",
    due_time: "15:30",
    importance: 1,
    project_id: 2,
    user_id: 1,
    finished: false,
  },
  {
    task_id: 5,
    title: "Buy train tickets for Thanksgiving",
    description: "Check prices and book tickets for the holiday",
    date_made: "2025-03-28",
    date_finished: undefined,
    due_date: "2025-04-01",
    due_time: undefined,
    importance: 2,
    project_id: 2,
    user_id: 1,
    finished: false,
  },
  {
    task_id: 6,
    title: "Small ham",
    description: "Pick up ham from the grocery store",
    date_made: "2025-03-28",
    date_finished: undefined,
    due_date: "2025-04-02",
    due_time: undefined,
    importance: 1,
    project_id: 3,
    user_id: 1,
    finished: false,
  },
]

// Mock projects
export const mockProjects: Project[] = [
  {
    project_id: 1,
    title: "Work",
    user_id: 1,
    color: "blue",
  },
  {
    project_id: 2,
    title: "Personal",
    user_id: 1,
    color: "green",
  },
  {
    project_id: 3,
    title: "Shopping",
    user_id: 1,
    color: "purple",
  },
]

// Mock notes
export const mockNotes: Note[] = [
  {
    note_id: 1,
    title: "Meeting Notes",
    description: "Discussed project timeline and deliverables. Next steps include...",
    user_id: 1,
  },
  {
    note_id: 2,
    title: "Shopping List",
    description: "- Milk\n- Eggs\n- Bread\n- Apples\n- Coffee",
    user_id: 1,
  },
  {
    note_id: 3,
    title: "Ideas for Weekend",
    description:
      "1. Visit the new museum exhibit\n2. Try that new restaurant downtown\n3. Go hiking if weather permits",
    user_id: 1,
  },
  {
    note_id: 4,
    title: "Project Brainstorm",
    description:
      "Key features to consider:\n- User authentication\n- Real-time updates\n- Mobile responsiveness\n- Dark mode",
    user_id: 1,
  },
  {
    note_id: 5,
    title: "Book Recommendations",
    description: "1. The Midnight Library\n2. Project Hail Mary\n3. Klara and the Sun\n4. The Four Winds",
    user_id: 1,
  },
]

// Helper function to get the next ID for a new item
export function getNextId(items: any[]): number {
  return (
    Math.max(
      0,
      ...items.map((item) => {
        const idKey = Object.keys(item).find((key) => key.endsWith("_id")) || ""
        return item[idKey]
      }),
    ) + 1
  )
}

// Helper function to get color hex values
export function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#a855f7",
    yellow: "#eab308",
    red: "#ef4444",
    indigo: "#6366f1",
    pink: "#ec4899",
    orange: "#f97316",
    gray: "#6b7280",
  }

  return colorMap[color] || colorMap.gray
}


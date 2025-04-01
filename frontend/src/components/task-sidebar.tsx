"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, ChevronDown, ChevronRight, Home, Inbox, ListTodo, Plus, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  collapsed: boolean
  activeView: string
  onSelectView: (view: string) => void
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  collapsed?: boolean
  onClick?: () => void
}

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
  collapsed?: boolean
  defaultOpen?: boolean
}

const SidebarItem = ({ icon, label, active = false, collapsed = false, onClick }: SidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start mb-1",
        active ? "bg-muted" : "hover:bg-muted/50",
        collapsed ? "px-2" : "px-3",
      )}
      onClick={onClick}
    >
      {icon}
      {!collapsed && <span className="ml-2">{label}</span>}
    </Button>
  )
}

const SidebarSection = ({ title, children, collapsed = false, defaultOpen = true }: SidebarSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (collapsed) {
    return <div className="mt-4">{children}</div>
  }

  return (
    <div className="mb-4">
      <button
        className="flex items-center w-full px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
        {title}
      </button>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  )
}

export default function Sidebar({ collapsed, activeView, onSelectView }: SidebarProps) {
  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex items-center justify-between mb-4 px-2">
        {!collapsed && <h2 className="font-semibold">Workspace</h2>}
        {!collapsed && (
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <SidebarItem
          icon={<Home className="h-4 w-4" />}
          label="Home"
          active={activeView === "home"}
          collapsed={collapsed}
          onClick={() => onSelectView("home")}
        />
        <SidebarItem
          icon={<Inbox className="h-4 w-4" />}
          label="Inbox"
          active={activeView === "todo"}
          collapsed={collapsed}
          onClick={() => onSelectView("todo")}
        />
        <SidebarItem
          icon={<Calendar className="h-4 w-4" />}
          label="Calendar"
          active={activeView === "calendar"}
          collapsed={collapsed}
          onClick={() => onSelectView("calendar")}
        />
        <SidebarItem
          icon={<ListTodo className="h-4 w-4" />}
          label="Notes"
          active={activeView === "notes"}
          collapsed={collapsed}
          onClick={() => onSelectView("notes")}
        />
      </div>

      <SidebarSection title="Projects" collapsed={collapsed}>
        <SidebarItem
          icon={<ListTodo className="h-4 w-4" />}
          label="Work Tasks"
          collapsed={collapsed}
          onClick={() => onSelectView("work-tasks")}
        />
        <SidebarItem
          icon={<ListTodo className="h-4 w-4" />}
          label="Personal Tasks"
          collapsed={collapsed}
          onClick={() => onSelectView("personal-tasks")}
        />
        <SidebarItem
          icon={<ListTodo className="h-4 w-4" />}
          label="Emails"
          collapsed={collapsed}
          onClick={() => onSelectView("emails")}
        />
        {!collapsed && (
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground pl-8 h-8">
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span className="text-sm">Add Project</span>
          </Button>
        )}
      </SidebarSection>

      <SidebarSection title="Labels" collapsed={collapsed}>
        <SidebarItem icon={<Tag className="h-4 w-4" />} label="Important" collapsed={collapsed} />
        <SidebarItem icon={<Tag className="h-4 w-4" />} label="Personal" collapsed={collapsed} />
        {!collapsed && (
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground pl-8 h-8">
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span className="text-sm">Add Label</span>
          </Button>
        )}
      </SidebarSection>
    </div>
  )
}


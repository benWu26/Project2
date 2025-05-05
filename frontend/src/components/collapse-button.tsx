import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollapseButtonProps {
  isCollapsed: boolean
  onClick: () => void
  className?: string
}

export function CollapseButton({ isCollapsed, onClick, className = "" }: CollapseButtonProps) {
  return (
    <Button variant="outline" size="icon" onClick={onClick} className={className}>
      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
    </Button>
  )
}

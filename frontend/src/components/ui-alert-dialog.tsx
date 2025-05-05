"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Create context for the alert dialog
type AlertContextType = {
  showAlert: (title: string, message: string) => Promise<void>
  showConfirm: (title: string, message: string) => Promise<boolean>
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

// Provider component
export function AlertProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isConfirm, setIsConfirm] = useState(false)
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const showAlert = (title: string, message: string) => {
    setTitle(title)
    setMessage(message)
    setIsConfirm(false)
    setOpen(true)

    return new Promise<void>((resolve) => {
      setResolveRef(() => {
        return () => {
          resolve()
          return true
        }
      })
    })
  }

  const showConfirm = (title: string, message: string) => {
    setTitle(title)
    setMessage(message)
    setIsConfirm(true)
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      setResolveRef(() => {
        return (value: boolean) => {
          resolve(value)
          return true
        }
      })
    })
  }

  const handleConfirm = () => {
    setOpen(false)
    if (resolveRef) resolveRef(true)
  }

  const handleCancel = () => {
    setOpen(false)
    if (resolveRef && isConfirm) resolveRef(false)
    else if (resolveRef) resolveRef(true)
  }

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {isConfirm && <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>}
            <AlertDialogAction onClick={handleConfirm}>{isConfirm ? "Confirm" : "OK"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  )
}

// Hook to use the alert dialog
export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}

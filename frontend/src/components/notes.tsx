import { useState, useEffect } from "react"
import { CalendarDays, File, FilePlus, FolderPlus, MoreVertical, Plus, Search, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Note } from "@/types"
import { mockNotes, currentUser, getNextId } from "@/lib/mock-data"
import { format } from "date-fns"

interface Folder {
  id: string
  name: string
}

export default function NotesView() {
  const [folders, setFolders] = useState<Folder[]>([
    { id: "all", name: "All Notes" },
    { id: "personal", name: "Personal" },
    { id: "work", name: "Work" },
    { id: "ideas", name: "Ideas" },
  ])

  const [notes, setNotes] = useState<Note[]>([])
  const [userId, setUserId] = useState<number>(1) // Default to 1 for demo
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("all")

  // Fetch user and notes on component mount
  useEffect(() => {
    setUserId(currentUser.user_id)
    setNotes(mockNotes)

    // Select the first note if available
    if (mockNotes.length > 0) {
      setSelectedNoteId(mockNotes[0].note_id)
    }

    setLoading(false)
  }, [])

  const selectedNote = notes.find((note) => note.note_id === selectedNoteId) || null

  // Filter notes based on search query and selected folder
  const filteredNotes = notes.filter((note) => {
    // Filter by folder (in a real app, notes would have folder/category field)
    const folderMatch = selectedFolder === "all" || true // For now, all notes match all folders

    // Filter by search query
    const searchMatch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false
      : true

    return folderMatch && searchMatch
  })

  const createNewNote = () => {
    try {
      const newNote: Note = {
        note_id: getNextId(notes),
        title: "Untitled Note",
        description: "",
        user_id: userId,
      }

      setNotes([newNote, ...notes])
      setSelectedNoteId(newNote.note_id)
    } catch (err) {
      console.error("Error creating note:", err)
      setError("Failed to create note. Please try again.")
    }
  }

  const updateNoteTitle = (id: number, title: string) => {
    try {
      setNotes(
        notes.map((note) => {
          if (note.note_id === id) {
            return { ...note, title }
          }
          return note
        }),
      )
    } catch (err) {
      console.error("Error updating note title:", err)
      setError("Failed to update note. Please try again.")
    }
  }

  const updateNoteContent = (id: number, description: string) => {
    try {
      setNotes(
        notes.map((note) => {
          if (note.note_id === id) {
            return { ...note, description }
          }
          return note
        }),
      )
    } catch (err) {
      console.error("Error updating note content:", err)
      setError("Failed to update note. Please try again.")
    }
  }

  const deleteNote = (id: number) => {
    try {
      setNotes(notes.filter((note) => note.note_id !== id))
      if (selectedNoteId === id) {
        setSelectedNoteId(notes.length > 1 ? (notes[0].note_id === id ? notes[1].note_id : notes[0].note_id) : null)
      }
    } catch (err) {
      console.error("Error deleting note:", err)
      setError("Failed to delete note. Please try again.")
    }
  }

  const createNewFolder = () => {
    const folderName = prompt("Enter folder name")
    if (folderName && folderName.trim()) {
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name: folderName.trim(),
      }
      setFolders([...folders, newFolder])
    }
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
      {/* Notes sidebar */}
      <div className="w-64 border-r flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Notes</h2>
            <Button variant="ghost" size="icon" onClick={createNewNote}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Folders */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">FOLDERS</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={createNewFolder}>
                  <FolderPlus className="h-3 w-3" />
                </Button>
              </div>

              {folders.map((folder) => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  className={`w-full justify-start text-left p-2 h-8 mb-1 ${
                    selectedFolder === folder.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <File className="h-4 w-4 mr-2" />
                  <span className="text-sm">{folder.name}</span>
                  {folder.id === "all" && <span className="ml-auto text-xs text-muted-foreground">{notes.length}</span>}
                </Button>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Notes list */}
            <div>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedFolder === "all"
                    ? "ALL NOTES"
                    : folders.find((f) => f.id === selectedFolder)?.name.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">{filteredNotes.length} notes</span>
              </div>

              {filteredNotes.map((note) => (
                <Button
                  key={note.note_id}
                  variant="ghost"
                  className={`w-full justify-start text-left p-2 h-auto mb-1 ${
                    selectedNoteId === note.note_id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedNoteId(note.note_id)}
                >
                  <div className="w-full">
                    <div className="font-medium truncate">{note.title}</div>
                    <div className="text-xs text-muted-foreground flex justify-between mt-1">
                      <span>{format(new Date(), "MMM d, yyyy")}</span>
                      <span className="truncate ml-2">
                        {note.description?.substring(0, 20) || ""}
                        {note.description && note.description.length > 20 ? "..." : ""}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}

              {filteredNotes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No notes found</div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Note editor */}
      {selectedNote ? (
        <div className="flex-1 flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center">
            <Input
              value={selectedNote.title}
              onChange={(e) => updateNoteTitle(selectedNote.note_id, e.target.value)}
              className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
              placeholder="Note title"
            />
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-2" />
                {format(new Date(), "MMM d, yyyy")}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FilePlus className="h-4 w-4 mr-2" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteNote(selectedNote.note_id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <Textarea
              value={selectedNote.description || ""}
              onChange={(e) => updateNoteContent(selectedNote.note_id, e.target.value)}
              className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 p-0"
              placeholder="Start writing..."
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>No note selected</p>
            <Button variant="outline" className="mt-2" onClick={createNewNote}>
              Create a new note
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


import { useState, useEffect } from "react"
import { CalendarDays, MoreVertical, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Note } from "@/lib/types"
import { format } from "date-fns"
import { useUser } from "@/hooks/UserContext"
import { cleanupOldNotes, createNote, deleteNote, getNotesByUser, updateNote } from "@/lib/api"

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [userId, setUserId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const user = useUser();

  useEffect(() => {
    async function fetchNotes() {
      try {
        const uid = user.user?.user_id || 1;
        setUserId(uid);

        const fetchedNotes = await getNotesByUser(uid);
        setNotes(fetchedNotes);

        if (fetchedNotes.length > 0) {
          setSelectedNoteId(fetchedNotes[0].note_id);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [user.user]);

  const selectedNote = notes.find((note) => note.note_id === selectedNoteId) || null;

  const filteredNotes = notes.filter((note) => {
    const searchMatch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return searchMatch;
  });

  const createNewNote = async () => {
    try {
      const newNote = await createNote({
        title: "Untitled Note",
        description: "",
        user_id: userId,
      });

      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.note_id);
    } catch (err) {
      console.error("Error creating note:", err);
      setError("Failed to create note.");
    }
  };

  const updateNoteTitle = async (id: number, title: string) => {
    try {
      const updated = await updateNote(id, { title });
      setNotes(
        notes.map((note) =>
          note.note_id === id ? { ...note, title: updated.title } : note
        )
      );
    } catch (err) {
      console.error("Error updating title:", err);
      setError("Failed to update note.");
    }
  };

  const updateNoteContent = async (id: number, description: string) => {
    try {
      const updated = await updateNote(id, { description });
      setNotes(
        notes.map((note) =>
          note.note_id === id ? { ...note, description: updated.description } : note
        )
      );
    } catch (err) {
      console.error("Error updating content:", err);
      setError("Failed to update note.");
    }
  };

  const deleteNoteById = async (id: number) => {
    try {
      await deleteNote(id);
      const updatedNotes = notes.filter((note) => note.note_id !== id);
      setNotes(updatedNotes);

      if (selectedNoteId === id) {
        const fallback = updatedNotes[0] || null;
        setSelectedNoteId(fallback ? fallback.note_id : null);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note.");
    }
  };


  const deleteOldNotes = async () => {
    setLoading(true);
    try {
      await cleanupOldNotes(userId, 0);
      const refreshed = await getNotesByUser(userId);
      setNotes(refreshed);
      if (!refreshed.find(n => n.note_id === selectedNoteId)) {
        setSelectedNoteId(refreshed[0]?.note_id || null);
      }
    } catch (err) {
      console.error("Error cleaning up notes:", err);
      setError("Failed to delete old notes.");
    } finally {
      setLoading(false);
    }
  };
  
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
            <Button
              variant="outline"
              className="w-full mt-2 text-xs"
              onClick={deleteOldNotes}
            >
              Delete Notes Older Than 30 Days
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
    

            <div>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">
                   ALL NOTES
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
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteNoteById(selectedNote.note_id)}
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


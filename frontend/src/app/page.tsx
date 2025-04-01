import React, { useState } from "react";
import { LogOut, User, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TodoView from "@/components/todo";
import NotesView from "@/components/notes";
//import CalendarView from "@/components/calendar";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/UserContext";
import {api } from "@/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TaskManager from "./taskpage";

export default function Home() {
    const navigate = useNavigate();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState<string>("todo");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleLogout = () => {
    navigate("/");
    logout();
    toast.success("Logged out successfully");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const response = await api.updateUser(user.user_id, profileData);
      toast.success("Profile updated successfully");
      console.log("Update response:", response);
      setIsProfileDialogOpen(false);
    } catch (error) {
      toast.success("Failed to update profile");
      console.error("Update error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await api.deleteUser(user.user_id);

      logout();
      setIsDeleteAccountDialogOpen(false);
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete account");
      console.error("Delete error:", error);
    }
  };

  const tabs = [
    { id: "todo", title: "Todo" },
    { id: "calendar", title: "Calendar" },
    { id: "notes", title: "Notes" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="border-b p-2 flex items-center bg-muted/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 mr-2">
              <Avatar className="h-7 w-7 mr-2">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={profileData.name} />
                <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{profileData.name}</span>
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Update Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center min-w-[120px] max-w-[200px] h-9 px-4 py-1 mr-1 rounded-t-lg cursor-pointer relative group",
                activeTab === tab.id
                  ? "bg-background text-foreground border-t border-l border-r border-border"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="truncate flex-1 text-sm">{tab.title}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeTab === "todo" && <TaskManager />}
        {activeTab === "calendar" && <CalendarView />}
        {activeTab === "notes" && <NotesView />}
      </div>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>Modify your profile information below.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
            <Label>Email</Label>
            <Input value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setIsDeleteAccountDialogOpen(true)}>Delete Account</Button>
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>This action is irreversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


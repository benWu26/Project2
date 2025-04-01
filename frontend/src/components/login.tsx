
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { PlusCircle, LogIn } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/hooks/UserContext"
import { api } from "@/api"
import { User } from "@/types"

export default function Login() {
 const navigate = useNavigate();
 const { login } = useUser();
 const [users, setUsers] = useState<User[]>([]);
 const [selectedUser, setSelectedUser] = useState<string>("");
 const [newUser, setNewUser] = useState<{ name: string; email: string }>({ name: "", email: "" });
 const [isAddUserOpen, setIsAddUserOpen] = useState(false);

 useEffect(() => {
   api.getAllUsers()
     .then(response => {
        console.log("Users:", response.data);
        setUsers(response.data);})
     .catch(error => console.error("Error fetching users:", error));
 }, [newUser]);

 const handleAddUser = () => {
   if (newUser.name && newUser.email) {
     api.createUser(newUser)
       .then(response => {
         setUsers([...users, response.data]);
         setNewUser({ name: "", email: "" });
         setIsAddUserOpen(false);
       })
       .catch(error => console.error("Error creating user:", error));
   }
 };

 const handleLogin = (userId: string) => {
   const user = users.find(u => u.user_id.toString() === userId);
   console.log(users)
   console.log("userId",userId)
   if (user) {
     console.log(user);
     login(user);
     navigate("/home");
   }
 };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground">Select a user to login or add a new user</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="user" className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={() => handleLogin(selectedUser)} disabled={!selectedUser} className="gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


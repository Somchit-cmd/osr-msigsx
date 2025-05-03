import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type AddUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: {
    username: string;
    name: string;
    surname: string;
    role: string;
    email: string;
    phone: string;
  }) => void;
};

export default function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    surname: "",
    role: "employee",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!open) {
      setNewUser({
        username: "",
        name: "",
        surname: "",
        role: "employee",
        email: "",
        phone: "",
      });
    }
  }, [open]);

  const isFormValid =
    newUser.username.trim() &&
    newUser.name.trim() &&
    newUser.surname.trim() &&
    newUser.email.trim() &&
    newUser.phone.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onAddUser(newUser);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" >Username</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="role" className="mb-2 block">Role</Label>
              <select
                id="role"
                className="w-full border rounded px-2 py-2"
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                
              </select>
            </div>
            <div>
              <Label htmlFor="name" className="mb-2 block">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="surname" className="mb-2 block">Surname</Label>
              <Input
                id="surname"
                value={newUser.surname}
                onChange={e => setNewUser({ ...newUser, surname: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2 block">Phone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

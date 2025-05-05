import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type AddUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: {
    id: string;
    name: string;
    surname: string;
    department: string;
    email: string;
    password: string;
    role: string;
  }) => void;
};

const departments = ["HR", "Health Claims", "Non-Health Claims", "Underwriting", "Legal & Compliance", "Finance & Accounting", "Sales & Marketing", "Executive"]; // Example departments

export default function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
  const [newUser, setNewUser] = useState({
    id: "",
    name: "",
    surname: "",
    department: "",
    email: "",
    password: "",
    role: "employee",
  });

  useEffect(() => {
    if (!open) {
      setNewUser({
        id: "",
        name: "",
        surname: "",
        department: "",
        email: "",
        password: "",
        role: "employee",
      });
    }
  }, [open]);

  // Auto-generate email when name or surname changes
  useEffect(() => {
    if (newUser.name && newUser.surname) {
      const email = `${newUser.name.trim().toLowerCase()}.${newUser.surname.trim().toLowerCase()}@msig-sokxay.com`;
      setNewUser(prev => ({ ...prev, email }));
    } else {
      setNewUser(prev => ({ ...prev, email: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUser.name, newUser.surname]);

  const isFormValid =
    newUser.id.trim() &&
    newUser.name.trim() &&
    newUser.surname.trim() &&
    newUser.department.trim() &&
    newUser.email.trim() &&
    newUser.password.trim() &&
    newUser.role.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onAddUser(newUser);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  value={newUser.surname}
                  onChange={e => setNewUser({ ...newUser, surname: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  className="w-full border rounded px-2 py-2"
                  value={newUser.department}
                  onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Account Information */}
          <div>
            <h3 className="font-semibold mb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id">User ID</Label>
                <Input
                  id="id"
                  value={newUser.id}
                  onChange={e => setNewUser({ ...newUser, id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={newUser.email}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
                
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="w-full border rounded px-2 py-2"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { subscribeToDepartments } from "@/lib/departmentService";

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    surname: string;
    department: string;
    email: string;
    password?: string;
    role: string;
  } | null;
  onEditUser: (user: {
    id: string;
    name: string;
    surname: string;
    department: string;
    email: string;
    password?: string;
    role: string;
  }) => void;
};

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  onEditUser,
}: EditUserDialogProps) {
  const [departments, setDepartments] = useState([]);
  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    surname: "",
    department: "",
    email: "",
    password: "",
    role: "employee",
  });

  useEffect(() => {
    if (user && open) {
      setEditUser({
        id: user.id || "",
        name: user.name || "",
        surname: user.surname || "",
        department: user.department || "",
        email: user.email || "",
        password: "",
        role: user.role || "employee",
      });
    }
  }, [user, open]);

  useEffect(() => {
    const unsubscribe = subscribeToDepartments(setDepartments);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editUser.name && editUser.surname) {
      const email = `${editUser.name.trim().toLowerCase()}.${editUser.surname
        .trim()
        .toLowerCase()}@msig-sokxay.com`;
      setEditUser((prev) => ({ ...prev, email }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editUser.name, editUser.surname]);

  const isFormValid =
    editUser.id.trim() &&
    editUser.name.trim() &&
    editUser.surname.trim() &&
    editUser.department.trim() &&
    editUser.email.trim() &&
    editUser.role.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onEditUser(editUser);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="mb-2">
                  First Name
                </Label>
                <Input
                  id="name"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname" className="mb-2">
                  Last Name
                </Label>
                <Input
                  id="surname"
                  value={editUser.surname}
                  onChange={(e) =>
                    setEditUser({ ...editUser, surname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="mb-2">
                  Department
                </Label>
                <select
                  id="department"
                  className="w-full border rounded px-2 py-2"
                  value={editUser.department}
                  onChange={(e) =>
                    setEditUser({ ...editUser, department: e.target.value })
                  }
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.name}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id" className="mb-2">
                  User ID
                </Label>
                <Input
                  id="id"
                  value={editUser.id}
                  onChange={(e) =>
                    setEditUser({ ...editUser, id: e.target.value })
                  }
                  required
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editUser.email}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="mb-2">
                  Role
                </Label>
                <select
                  id="role"
                  className="w-full border rounded px-2 py-2"
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

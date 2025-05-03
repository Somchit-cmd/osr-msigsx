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

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onEditUser: (user: any) => void;
};

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  onEditUser,
}: EditUserDialogProps) {
  const [editUser, setEditUser] = useState(user);

  useEffect(() => {
    setEditUser(user);
  }, [user, open]);

  if (!editUser) return null;

  const isFormValid =
    editUser.username?.trim() &&
    editUser.name?.trim() &&
    editUser.surname?.trim() &&
    editUser.email?.trim() &&
    editUser.phone?.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onEditUser(editUser);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="mb-2 block">
                Username
              </Label>
              <Input
                id="username"
                value={editUser.username}
                onChange={(e) =>
                  setEditUser({ ...editUser, username: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="role" className="mb-2 block">
                Role
              </Label>
              <select
                id="role"
                className="w-full border rounded px-2 py-2"
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Name
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
            <div>
              <Label htmlFor="surname" className="mb-2 block">
                Surname
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
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2 block">
                Phone
              </Label>
              <Input
                id="phone"
                value={editUser.phone}
                onChange={(e) =>
                  setEditUser({ ...editUser, phone: e.target.value })
                }
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

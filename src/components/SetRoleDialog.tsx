import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type SetRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSetRole: (role: string) => void;
};

export default function SetRoleDialog({ open, onOpenChange, user, onSetRole }: SetRoleDialogProps) {
  const [role, setRole] = useState(user?.role || "employee");

  useEffect(() => {
    setRole(user?.role || "employee");
  }, [user, open]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Role</DialogTitle>
        </DialogHeader>
        <div>
          <select
            className="w-full border rounded px-2 py-2"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
            
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSetRole(role); onOpenChange(false); }}>Set Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

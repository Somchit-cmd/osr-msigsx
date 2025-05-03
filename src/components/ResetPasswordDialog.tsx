import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onResetPassword: (newPassword: string) => void;
};

export default function ResetPasswordDialog({ open, onOpenChange, user, onResetPassword }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col items-center"
          onSubmit={e => {
            e.preventDefault();
            onResetPassword(password);
            onOpenChange(false);
          }}
        >
          <div className="w-full flex flex-col">
            <Label htmlFor="new-password" className="mb-2">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mb-2"
            />
          </div>
          <DialogFooter className="w-full flex justify-end gap-2 mt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!password}>
              Set New Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

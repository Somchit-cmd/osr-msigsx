import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RemoveUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onRemoveUser: () => void;
};

export default function RemoveUserDialog({ open, onOpenChange, user, onRemoveUser }: RemoveUserDialogProps) {
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove User</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to remove <b>{user.name} {user.surname}</b>?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onRemoveUser(); onOpenChange(false); }}>Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

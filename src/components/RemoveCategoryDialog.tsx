import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RemoveCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  onRemoveCategory: () => void;
};

export default function RemoveCategoryDialog({ open, onOpenChange, category, onRemoveCategory }: RemoveCategoryDialogProps) {
  if (!category) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Category</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to remove <b>{category}</b>?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onRemoveCategory(); onOpenChange(false); }}>Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

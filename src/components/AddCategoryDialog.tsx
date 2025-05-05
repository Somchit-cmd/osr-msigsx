import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type AddCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: string) => void;
};

export default function AddCategoryDialog({ open, onOpenChange, onAddCategory }: AddCategoryDialogProps) {
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (open) setCategory("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            onAddCategory(category);
            onOpenChange(false);
          }}
        >
          <Label htmlFor="category-name" className="mb-4">Category Name</Label>
          <Input
            id="category-name"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            className="mb-6"
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!category}>
              Add Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

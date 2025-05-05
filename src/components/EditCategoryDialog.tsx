import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type EditCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: { id: string, name: string } | null;
  onEditCategory: (newCategory: string) => void;
};

export default function EditCategoryDialog({ open, onOpenChange, category, onEditCategory }: EditCategoryDialogProps) {
  const [newCategory, setNewCategory] = useState(category?.name || "");

  useEffect(() => {
    setNewCategory(category?.name || "");
  }, [category, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            onEditCategory(newCategory);
            onOpenChange(false);
          }}
        >
          <Label htmlFor="edit-category-name" className="mb-2">Category Name</Label>
          <Input
            id="edit-category-name"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            required
            className="mb-6"
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newCategory}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

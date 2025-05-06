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

type AddCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: string) => void;
};

export default function AddCategoryDialog({
  open,
  onOpenChange,
  onAddCategory,
}: AddCategoryDialogProps) {
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (open) setCategory("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            onAddCategory(category);
            onOpenChange(false);
          }}
        >
          <div className="space-y-4">
            <Label htmlFor="category-name" className="mb-2">
              Category Name
            </Label>
            <Input
              id="category-name"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="mb-4"
            />
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!category}>
                Add Category
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

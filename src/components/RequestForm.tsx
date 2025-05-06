import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departments, employees } from "@/data/mockData";
import { Equipment, InventoryItem } from "@/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: InventoryItem | null;
  onSubmit: (formData: any) => void;
}

export default function RequestForm({
  isOpen,
  onClose,
  equipment,
  onSubmit,
}: RequestFormProps) {
  const { toast } = useToast();

  // Set up form state
  const [formData, setFormData] = useState({
    employeeName: "",
    department: "",
    quantity: 1,
    notes: "",
  });

  // Update form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      const user =
        JSON.parse(sessionStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
      setFormData({
        employeeName: user ? `${user.name} ${user.surname}` : "",
        department: user ? user.department : "",
        quantity: 1,
        notes: "",
      });
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequestSubmit = async (formData: any) => {
    try {
      const user =
        JSON.parse(sessionStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
      await addDoc(collection(db, "requests"), {
        ...formData,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        employeeId: user.id,
        employeeName: user.name + " " + user.surname,
        department: user.department,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      toast({
        title: "Request submitted successfully",
        description: `Your request for ${formData.quantity} ${formData.equipmentName}(s) is being processed.`,
      });
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment) return;
    
    if (formData.quantity > equipment.available) {
      toast({
        title: "Invalid quantity",
        description: `Only ${equipment.available} ${equipment.name}(s) available.`,
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({
      ...formData,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
    });
    
    handleRequestSubmit({
      ...formData,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Office Supplies</DialogTitle>
          <DialogDescription>
            Fill out this form to request {equipment?.name}. You'll be notified when your request is processed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Full Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="equipment">Office Supply</Label>
            <Input
              id="equipment"
              value={equipment?.name || ""}
              readOnly
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center">
              <Input
                id="quantity"
                type="number"
                min={1}
                max={equipment?.available || 1}
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value))}
                className="w-24"
              />
              <span className="ml-2 text-gray-500 text-sm">
                {equipment?.available || 0} available
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details about your request..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-blue hover:bg-brand-blue/90">
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { createItemLimitation, updateItemLimitation, deleteItemLimitation, subscribeToItemLimitations } from "@/lib/limitationService";
import { useTranslation } from "react-i18next";

export default function ItemLimitationsDialog({ open, onOpenChange, item }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [limitations, setLimitations] = useState([]);
  const [newLimitation, setNewLimitation] = useState({
    position: "",
    monthlyLimit: 1
  });

  // Subscribe to limitations for this item
  useEffect(() => {
    if (open && item) {
      const unsubscribe = subscribeToItemLimitations((allLimitations) => {
        const itemLimitations = allLimitations.filter(limit => limit.itemId === item.id);
        setLimitations(itemLimitations);
      });
      
      return () => unsubscribe();
    }
  }, [open, item]);

  const handleAddLimitation = async () => {
    if (!newLimitation.position || newLimitation.monthlyLimit < 1) {
      toast({
        title: "Invalid input",
        description: "Please select a position and set a valid monthly limit.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createItemLimitation({
        itemId: item.id,
        itemName: item.name,
        position: newLimitation.position,
        monthlyLimit: newLimitation.monthlyLimit
      });

      setNewLimitation({
        position: "",
        monthlyLimit: 1
      });

      toast({
        title: "Limitation added",
        description: `Monthly limit for ${newLimitation.position} has been set.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add limitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLimitation = async (id, newLimit) => {
    try {
      await updateItemLimitation(id, {
        monthlyLimit: newLimit
      });

      toast({
        title: "Limitation updated",
        description: "Monthly limit has been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update limitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLimitation = async (id) => {
    try {
      await deleteItemLimitation(id);

      toast({
        title: "Limitation removed",
        description: "Monthly limit has been removed."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove limitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("limitations.title")}</DialogTitle>
          <DialogDescription>
            {t("limitations.description", { name: item?.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Limitations */}
          <div>
            <h3 className="text-lg font-medium mb-2">{t("limitations.current")}</h3>
            {limitations.length === 0 ? (
              <p className="text-sm text-gray-500">{t("limitations.noLimits")}</p>
            ) : (
              <div className="space-y-2">
                {limitations.map((limit) => (
                  <div key={limit.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div>
                      <p className="font-medium">{limit.position}</p>
                      <p className="text-sm text-gray-600">
                        {t("limitations.monthlyLimit")}: {limit.monthlyLimit}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        min={1}
                        value={limit.monthlyLimit}
                        onChange={(e) => handleUpdateLimitation(limit.id, parseInt(e.target.value))}
                        className="w-20"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLimitation(limit.id)}
                        className="text-red-500"
                      >
                        {t("common.remove")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Limitation */}
          <div>
            <h3 className="text-lg font-medium mb-2">{t("limitations.addNew")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">{t("limitations.position")}</Label>
                <select
                  id="position"
                  className="w-full border rounded px-2 py-2"
                  value={newLimitation.position}
                  onChange={(e) => setNewLimitation({...newLimitation, position: e.target.value})}
                >
                  <option value="">{t("limitations.selectPosition")}</option>
                  <option value="Manager">Manager</option>
                  <option value="Officer">Officer</option>
                  <option value="Assistant">Assistant</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">{t("limitations.monthlyLimit")}</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  min={1}
                  value={newLimitation.monthlyLimit}
                  onChange={(e) => setNewLimitation({...newLimitation, monthlyLimit: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <Button
              onClick={handleAddLimitation}
              className="mt-4"
            >
              {t("limitations.addLimit")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

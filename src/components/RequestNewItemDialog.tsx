import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RequestNewItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const RequestNewItemDialog = ({ isOpen, onClose, user }: RequestNewItemDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [itemName, setItemName] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createNotificationForAdmins = async (itemName: string, userName: string) => {
    try {
      // Direct approach - create a notification in a special "admin-notifications" collection
      await addDoc(collection(db, "notifications"), {
        // Use a special admin ID that all admins can see
        userId: "admin", // Assuming admins can see notifications with userId="admin"
        type: "new_request",
        read: false,
        createdAt: serverTimestamp(),
        message: "notificationMessages.newItemRequestSubmitted",
        messageParams: {
          itemName: itemName,
          userName: userName || "User"
        }
      });
      
      // Also try to find specific admin users and create individual notifications
      try {
        const usersRef = collection(db, "users");
        const adminQuery = query(usersRef, where("role", "==", "admin"));
        const adminSnapshot = await getDocs(adminQuery);
        
        // Create notifications only if we found admin users
        if (!adminSnapshot.empty) {
          const notificationPromises = adminSnapshot.docs.map(admin => {
            return addDoc(collection(db, "notifications"), {
              userId: admin.id,
              type: "new_request",
              read: false,
              createdAt: serverTimestamp(),
              message: "notificationMessages.newItemRequestSubmitted",
              messageParams: {
                itemName: itemName,
                userName: userName || "User"
              }
            });
          });
          
          await Promise.all(notificationPromises);
        }
      } catch (adminError) {
        console.error("Error with admin-specific notifications:", adminError);
        // We already created the general admin notification, so we can continue
      }
    } catch (error) {
      console.error("Error creating admin notifications:", error);
      // Don't throw the error - we don't want to prevent the item request from being submitted
    }
  };

  const handleSubmit = async () => {
    if (!itemName) {
      toast({
        title: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const documentData: any = {
        itemName,
        reason,
        userId: user?.id || '',
        employeeName: user?.name || '',
        status: "pending",
        createdAt: serverTimestamp(),
      };
      
      // Only add employeeId if it exists
      if (user?.employeeId) {
        documentData.employeeId = user.employeeId;
      }

      // First submit the request
      const docRef = await addDoc(collection(db, "newItemRequests"), documentData);
      
      // Then create notifications for admins (in a try/catch to prevent affecting the main flow)
      try {
        await createNotificationForAdmins(itemName, user?.name);
      } catch (notifyError) {
        console.error("Error in notification creation:", notifyError);
        // Continue with the success flow regardless of notification errors
      }

      toast({
        title: "Request Submitted",
        description: "Your request for a new item has been submitted for review.",
      });
      onClose();
      setItemName("");
      setReason("");
    } catch (error) {
      console.error("Error submitting new item request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("requestNewItemDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("requestNewItemDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="itemName" className="text-right">
              {t("requestNewItemDialog.itemName")}
            </label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="col-span-3"
              placeholder={t("requestNewItemDialog.itemNamePlaceholder")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="reason" className="text-right">
              {t("requestNewItemDialog.reason")}
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder={t("requestNewItemDialog.reasonPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("requestNewItemDialog.submitting") : t("requestNewItemDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestNewItemDialog; 
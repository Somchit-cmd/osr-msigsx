import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EquipmentRequest, RequestStatus } from "@/types";
import {
  formatDate,
  getStatusBadgeClass,
  capitalizeFirstLetter,
} from "@/utils/helpers";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

interface RequestTableProps {
  requests: EquipmentRequest[];
  isAdmin?: boolean;
  onAction?: (id: string, action: "approve" | "reject" | "fulfill") => void;
}

export default function RequestTable({
  requests,
  isAdmin = false,
  onAction,
}: RequestTableProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [rejectNote, setRejectNote] = useState("");
  const { toast } = useToast();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusMap = {
    approve: "approved",
    reject: "rejected",
    fulfill: "fulfilled",
  };

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "fulfill"
  ) => {
    let update: any = { status: statusMap[action] };
    if (action === "approve") update.approvedAt = Timestamp.now();
    if (action === "fulfill") update.fulfilledAt = Timestamp.now();

    await updateDoc(doc(db, "requests", id), update);

    // Add notification for the user - this is the missing part
    const request = requests.find((r) => r.id === id);
    if (request?.employeeId) {
      await addDoc(collection(db, "notifications"), {
        userId: request.employeeId,
        type: `request_${statusMap[action]}`,
        requestId: id,
        message:
          action === "approve"
            ? `notificationMessages.requestApproved`
            : `notificationMessages.request${
                action.charAt(0).toUpperCase() + action.slice(1)
              }ed`,
        messageParams: { id },
        read: false,
        createdAt: Timestamp.now(),
      });
    }

    toast({
      title: t(`requestTable.${action}Success`),
      description: t(`requestTable.${action}Description`, { id }),
    });

    // Add this: re-fetch requests
    if (typeof window !== "undefined" && window.location) {
      window.location.reload(); // Quick fix: reloads the page
    }
    // Or, better: call your fetch function to update the requests state
  };

  const handleReject = async (id: string) => {
    setSelectedRequestId(id);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedRequestId) return;

    const update = {
      status: "rejected",
      adminNotes: rejectNote,
      rejectedAt: Timestamp.now(),
    };

    await updateDoc(doc(db, "requests", selectedRequestId), update);

    // Add notification for the user
    const request = requests.find((r) => r.id === selectedRequestId);
    if (request?.employeeId) {
      await addDoc(collection(db, "notifications"), {
        userId: request.employeeId,
        type: "request_rejected",
        requestId: selectedRequestId,
        message: "notificationMessages.requestRejected",
        messageParams: { id: selectedRequestId },
        read: false,
        createdAt: Timestamp.now(),
      });
    }

    toast({
      title: "Request rejected",
      description: `Request #${selectedRequestId} has been rejected successfully.`,
    });

    setRejectDialogOpen(false);
    setRejectNote("");
    setSelectedRequestId(null);
  };

  const actionHandler = onAction || handleAction; // fallback to local if not provided

  return (
    <>
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] bg-gray-100 font-bold">
                {t("requestTable.equipment")}
              </TableHead>
              {isAdmin && (
                <TableHead className="bg-gray-100 font-bold">
                  {t("requestTable.employee")}
                </TableHead>
              )}
              {isAdmin && (
                <TableHead className="bg-gray-100 font-bold">
                  {t("requestTable.department")}
                </TableHead>
              )}
              <TableHead className="text-center bg-gray-100 font-bold">
                {t("requestTable.quantity")}
              </TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">
                {t("requestTable.requestDate")}
              </TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">
                {t("requestTable.approveDate")}
              </TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">
                {t("requestTable.fulfilledDate")}
              </TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">
                {t("requestTable.status")}
              </TableHead>
              <TableHead className="text-right bg-gray-100 font-bold">
                {t("requestTable.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 5}
                  className="text-center py-8 text-gray-500"
                >
                  {t("requestTable.noRequests")}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <>
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.equipmentName}
                    </TableCell>
                    {isAdmin && <TableCell>{request.employeeName}</TableCell>}
                    {isAdmin && <TableCell>{request.department}</TableCell>}
                    <TableCell className="text-center">
                      {request.quantity}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.approvedAt
                        ? request.approvedAt.toDate
                          ? request.approvedAt.toDate().toLocaleString()
                          : new Date(request.approvedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.fulfilledAt
                        ? request.fulfilledAt.toDate
                          ? request.fulfilledAt.toDate().toLocaleString()
                          : new Date(request.fulfilledAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`${getStatusBadgeClass(request.status)}`}
                      >
                        {t(`requestTable.statuses.${request.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(request.id)}
                        >
                          {expandedId === request.id
                            ? t("requestTable.hide")
                            : t("requestTable.details")}
                        </Button>

                        {isAdmin && request.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                actionHandler(request.id, "approve")
                              }
                              className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            >
                              {t("requestTable.approve")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                              className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            >
                              {t("requestTable.reject")}
                            </Button>
                          </>
                        )}

                        {isAdmin && request.status === "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actionHandler(request.id, "fulfill")}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 ml-2"
                          >
                            {t("requestTable.fulfill")}
                          </Button>
                        )}

                        {!isAdmin && request.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await updateDoc(doc(db, "requests", request.id), {
                                status: "cancelled",
                              });
                              toast({
                                title: "Request Cancelled",
                                description: `Request #${request.id} has been cancelled.`,
                              });
                              window.location.reload(); // Or trigger a re-fetch of requests
                            }}
                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                          >
                            {t("requestTable.cancel")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === request.id && (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 7 : 5}
                        className="bg-gray-50 p-4"
                      >
                        <div className="space-y-2 text-sm">
                          {request.notes && (
                            <div>
                              <span className="font-medium">
                                {t("requestTable.requestNotes")}:
                              </span>{" "}
                              {request.notes}
                            </div>
                          )}

                          {request.adminNotes && (
                            <div>
                              <span className="font-medium">
                                {t("requestTable.adminNotes")}:
                              </span>{" "}
                              {request.adminNotes}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium">
                                {t("requestTable.requestDate")}:
                              </span>{" "}
                              {formatDate(request.createdAt)}
                            </div>

                            {request.approvalDate && (
                              <div>
                                <span className="font-medium">
                                  {t("requestTable.approveDate")}:
                                </span>{" "}
                                {formatDate(request.approvalDate)}
                              </div>
                            )}

                            {request.fulfillmentDate && (
                              <div>
                                <span className="font-medium">
                                  {t("requestTable.fulfilledDate")}:
                                </span>{" "}
                                {formatDate(request.fulfillmentDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("requestTable.rejectRequest")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={t("requestTable.rejectReasonPlaceholder")}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              {t("requestTable.confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

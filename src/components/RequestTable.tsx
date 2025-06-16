import React, { useState, useMemo } from "react";
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
import { doc, updateDoc, Timestamp, writeBatch } from "firebase/firestore";
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
import { ChevronDown, ChevronUp, Package } from "lucide-react";

// Extend the EquipmentRequest type to include groupId
interface ExtendedRequest extends EquipmentRequest {
  groupId?: string;
}

interface RequestTableProps {
  requests: ExtendedRequest[];
  isAdmin?: boolean;
  onAction?: (id: string, action: "approve" | "reject" | "fulfill") => void;
  onDelete?: (id: string) => void;
}

export default function RequestTable({
  requests,
  isAdmin = false,
  onAction,
  onDelete,
}: RequestTableProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [rejectNote, setRejectNote] = useState("");
  const { toast } = useToast();

  // Group requests by groupId for display
  const groupedRequests = useMemo(() => {
    const result: { [key: string]: ExtendedRequest[] } = {};
    
    // First, handle requests without groupId
    const nonGroupedRequests = requests.filter(r => !r.groupId);
    nonGroupedRequests.forEach(req => {
      result[req.id] = [req];
    });
    
    // Then handle grouped requests
    const groupedReqs = requests.filter(r => r.groupId);
    groupedReqs.forEach(req => {
      if (!result[req.groupId!]) {
        result[req.groupId!] = [];
      }
      result[req.groupId!].push(req);
    });
    
    return result;
  }, [requests]);

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

  const handleGroupAction = async (
    groupId: string,
    action: "approve" | "reject" | "fulfill"
  ) => {
    const groupRequests = groupedRequests[groupId] || [];
    if (groupRequests.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      let update: any = { status: statusMap[action] };
      
      if (action === "approve") update.approvedAt = now;
      if (action === "fulfill") update.fulfilledAt = now;
      
      // Update all requests in the group
      groupRequests.forEach(request => {
        const requestRef = doc(db, "requests", request.id);
        batch.update(requestRef, update);
      });
      
      // Commit the batch
      await batch.commit();
      
      // Add notification for the user
      const sampleRequest = groupRequests[0];
      if (sampleRequest?.employeeId) {
        await addDoc(collection(db, "notifications"), {
          userId: sampleRequest.employeeId,
          type: `request_group_${statusMap[action]}`,
          requestGroupId: groupId,
          message: `notificationMessages.requestGroup${capitalizeFirstLetter(action)}ed`,
          messageParams: { 
            count: groupRequests.length 
          },
          read: false,
          createdAt: Timestamp.now(),
        });
      }
      
      toast({
        title: t(`requestTable.group${capitalizeFirstLetter(action)}Success`),
        description: t(`requestTable.group${capitalizeFirstLetter(action)}Description`, { 
          count: groupRequests.length 
        }),
      });
      
      // Refresh the page
      if (typeof window !== "undefined" && window.location) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error handling group action:", error);
      toast({
        title: "Error",
        description: "There was an error processing the request.",
        variant: "destructive",
      });
    }
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

  const handleDelete = (id: string) => {
    setSelectedRequestId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRequestId) return;
    if (onDelete) {
      onDelete(selectedRequestId);
    }
    setDeleteDialogOpen(false);
    setSelectedRequestId(null);
  };

  const actionHandler = onAction || handleAction; // fallback to local if not provided

  // Render table with grouped requests
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
                {t("requestTable.status")}
              </TableHead>
              <TableHead className="text-right bg-gray-100 font-bold">
                {t("requestTable.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(groupedRequests).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 5}
                  className="text-center py-8 text-gray-500"
                >
                  {t("requestTable.noRequests")}
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedRequests).map(([groupId, groupItems]) => {
                const isGroup = groupItems.length > 1;
                const sampleRequest = groupItems[0];
                const isExpanded = expandedId === groupId;

                const mainRow = (
                  <TableRow
                    key={groupId}
                    className={`${
                      isGroup ? "bg-blue-50 hover:bg-blue-100" : ""
                    } ${isExpanded ? "border-b-0" : ""}`}
                    onClick={() => isGroup && toggleExpand(groupId)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {isGroup && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2 p-0 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(groupId);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {isGroup ? (
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            <span>
                              {t("requestTable.multiItemOrder", {
                                count: groupItems.length,
                              })}
                            </span>
                          </div>
                        ) : (
                          sampleRequest.equipmentName
                        )}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>{sampleRequest.employeeName}</TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>{sampleRequest.department}</TableCell>
                    )}
                    <TableCell className="text-center">
                      {isGroup
                        ? groupItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )
                        : sampleRequest.quantity}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(sampleRequest.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`${getStatusBadgeClass(
                          sampleRequest.status
                        )}`}
                      >
                        {t(`requestTable.statuses.${sampleRequest.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {isAdmin && sampleRequest.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                isGroup
                                  ? handleGroupAction(groupId, "approve")
                                  : actionHandler(
                                      sampleRequest.id,
                                      "approve"
                                    );
                              }}
                            >
                              {t("requestTable.approve")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(sampleRequest.id);
                              }}
                            >
                              {t("requestTable.reject")}
                            </Button>
                          </>
                        )}
                        {isAdmin && sampleRequest.status === "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              isGroup
                                ? handleGroupAction(groupId, "fulfill")
                                : actionHandler(sampleRequest.id, "fulfill");
                            }}
                          >
                            {t("requestTable.fulfill")}
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sampleRequest.id);
                            }}
                          >
                            {t("requestTable.delete")}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(groupId);
                          }}
                        >
                          {isExpanded
                            ? t("requestTable.less")
                            : t("requestTable.details")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );

                const expandedRow = isExpanded ? (
                  <TableRow
                    key={`${groupId}-details`}
                    className="bg-gray-50"
                  >
                    <TableCell colSpan={isAdmin ? 7 : 5} className="p-4">
                      <div className="space-y-4">
                        {/* Notes section */}
                        {sampleRequest.notes && (
                          <div>
                            <h4 className="font-semibold mb-1">
                              {t("requestTable.notes")}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {sampleRequest.notes}
                            </p>
                          </div>
                        )}

                        {/* For grouped requests, show item details */}
                        {isGroup && (
                          <div>
                            <h4 className="font-semibold mb-2">
                              {t("requestTable.itemsInOrder")}
                            </h4>
                            <div className="bg-white rounded border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {t("requestTable.item")}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {t("requestTable.quantity")}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {t("requestTable.status")}
                                    </TableHead>
                                    {isAdmin &&
                                      sampleRequest.status === "pending" && (
                                        <TableHead className="text-right">
                                          {t("requestTable.actions")}
                                        </TableHead>
                                      )}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {groupItems.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        {item.equipmentName}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {item.quantity}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge
                                          variant="outline"
                                          className={`${getStatusBadgeClass(
                                            item.status
                                          )}`}
                                        >
                                          {t(
                                            `requestTable.statuses.${item.status}`
                                          )}
                                        </Badge>
                                      </TableCell>
                                      {isAdmin &&
                                        sampleRequest.status === "pending" && (
                                          <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  actionHandler(
                                                    item.id,
                                                    "approve"
                                                  )
                                                }
                                              >
                                                {t("requestTable.approve")}
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleReject(item.id)
                                                }
                                              >
                                                {t("requestTable.reject")}
                                              </Button>
                                            </div>
                                          </TableCell>
                                        )}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Timeline/history */}
                        <div>
                          <h4 className="font-semibold mb-2">
                            {t("requestTable.timeline")}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                              <div>
                                <p className="text-sm font-medium">
                                  {t("requestTable.requestCreated")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(sampleRequest.createdAt)}
                                </p>
                              </div>
                            </div>

                            {sampleRequest.approvedAt && (
                              <div className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 mr-2"></div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {t("requestTable.requestApproved")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(sampleRequest.approvedAt)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {sampleRequest.fulfilledAt && (
                              <div className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {t("requestTable.requestFulfilled")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(sampleRequest.fulfilledAt)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null;

                return [mainRow, expandedRow];
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("requestTable.rejectRequest")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">{t("requestTable.rejectReason")}</p>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder={t("requestTable.rejectReasonPlaceholder")}
              className="min-h-32"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              {t("requestTable.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              {t("requestTable.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("requestTable.deleteRequest")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t("requestTable.deleteConfirmation")}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("requestTable.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("requestTable.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

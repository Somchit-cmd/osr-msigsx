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
import { formatDate, getStatusBadgeClass, capitalizeFirstLetter } from "@/utils/helpers";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc } from "firebase/firestore";

interface RequestTableProps {
  requests: EquipmentRequest[];
  isAdmin?: boolean;
  onAction?: (id: string, action: 'approve' | 'reject' | 'fulfill') => void;
}

export default function RequestTable({ requests, isAdmin = false, onAction }: RequestTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const { toast } = useToast();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusMap = {
    approve: "approved",
    reject: "rejected",
    fulfill: "fulfilled"
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'fulfill') => {
    let update: any = { status: statusMap[action] };
    if (action === "approve") update.approvedAt = Timestamp.now();
    if (action === "fulfill") update.fulfilledAt = Timestamp.now();

    await updateDoc(doc(db, "requests", id), update);

    toast({
      title: `Request ${statusMap[action]}`,
      description: `Request #${id} has been ${statusMap[action]} successfully.`,
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
      rejectedAt: Timestamp.now()
    };

    await updateDoc(doc(db, "requests", selectedRequestId), update);

    // Add notification for the user
    const request = requests.find(r => r.id === selectedRequestId);
    if (request?.employeeId) {
      await addDoc(collection(db, "notifications"), {
        userId: request.employeeId,
        type: "request_rejected",
        requestId: selectedRequestId,
        message: `Your request #${selectedRequestId} was rejected.${rejectNote ? ` Reason: ${rejectNote}` : ''}`,
        read: false,
        createdAt: Timestamp.now()
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
              <TableHead className="w-[180px] bg-gray-100 font-bold">Equipment</TableHead>
              {isAdmin && <TableHead className="bg-gray-100 font-bold">Employee</TableHead>}
              {isAdmin && <TableHead className="bg-gray-100 font-bold">Department</TableHead>}
              <TableHead className="text-center bg-gray-100 font-bold">Quantity</TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">Request Date</TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">Approve Date</TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">Fulfilled Date</TableHead>
              <TableHead className="text-center bg-gray-100 font-bold">Status</TableHead>
              <TableHead className="text-right bg-gray-100 font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 5} className="text-center py-8 text-gray-500">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <>
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.equipmentName}</TableCell>
                    {isAdmin && <TableCell>{request.employeeName}</TableCell>}
                    {isAdmin && <TableCell>{request.department}</TableCell>}
                    <TableCell className="text-center">{request.quantity}</TableCell>
                    <TableCell className="text-center">{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="text-center">
                      {request.approvedAt
                        ? (request.approvedAt.toDate
                            ? request.approvedAt.toDate().toLocaleString()
                            : new Date(request.approvedAt).toLocaleString())
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.fulfilledAt
                        ? (request.fulfilledAt.toDate
                            ? request.fulfilledAt.toDate().toLocaleString()
                            : new Date(request.fulfilledAt).toLocaleString())
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${getStatusBadgeClass(request.status)}`}>
                        {capitalizeFirstLetter(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(request.id)}
                        >
                          {expandedId === request.id ? "Hide" : "Details"}
                        </Button>
                        
                        {isAdmin && request.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => actionHandler(request.id, "approve")}
                              className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm" 
                              onClick={() => handleReject(request.id)}
                              className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            >
                              Reject
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
                            Fulfill
                          </Button>
                        )}

                        {!isAdmin && request.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await updateDoc(doc(db, "requests", request.id), { status: "cancelled" });
                              toast({
                                title: "Request Cancelled",
                                description: `Request #${request.id} has been cancelled.`,
                              });
                              window.location.reload(); // Or trigger a re-fetch of requests
                            }}
                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === request.id && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 5} className="bg-gray-50 p-4">
                        <div className="space-y-2 text-sm">
                          {request.notes && (
                            <div>
                              <span className="font-medium">Request Notes:</span> {request.notes}
                            </div>
                          )}
                          
                          {request.adminNotes && (
                            <div>
                              <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium">Request Date:</span>{" "}
                              {formatDate(request.createdAt)}
                            </div>
                            
                            {request.approvalDate && (
                              <div>
                                <span className="font-medium">Approval Date:</span>{" "}
                                {formatDate(request.approvalDate)}
                              </div>
                            )}
                            
                            {request.fulfillmentDate && (
                              <div>
                                <span className="font-medium">Fulfillment Date:</span>{" "}
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
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for rejection (optional)"
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

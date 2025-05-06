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

interface RequestTableProps {
  requests: EquipmentRequest[];
  isAdmin?: boolean;
  onAction?: (id: string, action: 'approve' | 'reject' | 'fulfill') => void;
}

export default function RequestTable({ requests, isAdmin = false, onAction }: RequestTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] bg-gray-100 font-bold">Equipment</TableHead>
            {isAdmin && <TableHead className="bg-gray-100 font-bold">Employee</TableHead>}
            {isAdmin && <TableHead className="bg-gray-100 font-bold">Department</TableHead>}
            <TableHead className="text-center bg-gray-100 font-bold">Quantity</TableHead>
            <TableHead className="text-center bg-gray-100 font-bold">Request Date</TableHead>
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
                            onClick={() => onAction?.(request.id, "approve")}
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm" 
                            onClick={() => onAction?.(request.id, "reject")}
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
                          onClick={() => onAction?.(request.id, "fulfill")}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                        >
                          Mark Fulfilled
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
  );
}

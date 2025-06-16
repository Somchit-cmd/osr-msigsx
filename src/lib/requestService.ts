import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
  writeBatch
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { recordItemUsage } from "./usageTrackingService";

// Types
export interface Request {
  id?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  fulfilledAt?: Timestamp;
  groupId?: string; // ID to group requests that were submitted together
}

// Interface for bulk request with multiple items
export interface BulkRequest {
  items: {
    equipmentId: string;
    equipmentName: string;
    quantity: number;
  }[];
  employeeId: string;
  employeeName: string;
  department: string;
  notes?: string;
}

// Create a new request
export async function createRequest(request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) {
  const newRequest = {
    ...request,
    status: 'pending' as const,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  return await addDoc(collection(db, "requests"), newRequest);
}

// Update request status
export async function updateRequestStatus(
  requestId: string, 
  status: Request['status'],
  userId: string
) {
  const updateData: Partial<Request> = {
    status,
    updatedAt: Timestamp.now()
  };

  if (status === 'approved') {
    updateData.approvedBy = userId;
    updateData.approvedAt = Timestamp.now();
    
    // Get the request details to record usage
    const requestDoc = await getDoc(doc(db, "requests", requestId));
    if (requestDoc.exists()) {
      const requestData = requestDoc.data() as Request;
      
      // Record usage when approved
      await recordItemUsage(
        requestData.employeeId,
        requestData.equipmentId,
        requestData.equipmentName,
        requestData.quantity
      );
    }
  } else if (status === 'fulfilled') {
    updateData.fulfilledAt = Timestamp.now();
  }

  return await updateDoc(doc(db, "requests", requestId), updateData);
}

// Delete a request
export async function deleteRequest(requestId: string) {
  return await deleteDoc(doc(db, "requests", requestId));
}

// Subscribe to user's requests
export function subscribeToUserRequests(
  userId: string,
  callback: (requests: Request[]) => void
) {
  const q = query(
    collection(db, "requests"),
    where("employeeId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Request[];
    callback(requests);
  });
}

// Create a bulk request with multiple items
export async function createBulkRequest(bulkRequest: BulkRequest) {
  try {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    
    // Generate a group ID to link all requests together
    const groupId = `group_${Date.now()}_${bulkRequest.employeeId}`;
    
    // Create a request document for each item
    for (const item of bulkRequest.items) {
      const requestData = {
        employeeId: bulkRequest.employeeId,
        employeeName: bulkRequest.employeeName,
        department: bulkRequest.department,
        equipmentId: item.equipmentId,
        equipmentName: item.equipmentName,
        quantity: item.quantity,
        status: 'pending' as const,
        priority: 'medium' as const, // Default priority
        notes: bulkRequest.notes,
        createdAt: now,
        updatedAt: now,
        groupId: groupId // Add the group ID to link related requests
      };
      
      // Add to batch
      const newRequestRef = doc(collection(db, "requests"));
      batch.set(newRequestRef, requestData);
    }
    
    // Add a notification for admin
    const notificationRef = doc(collection(db, "notifications"));
    batch.set(notificationRef, {
      userId: "admin",
      type: "new_bulk_request",
      requestGroupId: groupId,
      message: "notificationMessages.newBulkRequest",
      messageParams: {
        name: bulkRequest.employeeName,
        count: bulkRequest.items.length
      },
      read: false,
      createdAt: now
    });
    
    // Commit the batch
    await batch.commit();
    
    return { success: true, groupId };
  } catch (error) {
    console.error("Error creating bulk request:", error);
    throw error;
  }
}

// Subscribe to all requests (for admin)
export function subscribeToAllRequests(
  callback: (requests: Request[]) => void,
  filters?: {
    status?: Request['status'];
    department?: string;
  }
) {
  let q = query(
    collection(db, "requests"),
    orderBy("createdAt", "desc")
  );

  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }

  if (filters?.department) {
    q = query(q, where("department", "==", filters.department));
  }

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Request[];
    callback(requests);
  });
} 
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
  Timestamp
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

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
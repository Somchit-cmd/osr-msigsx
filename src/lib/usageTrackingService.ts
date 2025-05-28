import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { ItemLimitation } from "./limitationService";

// Types
export interface MonthlyUsage {
  id?: string;
  userId: string;
  itemId: string;
  itemName: string;
  year: number;
  month: number; // 1-12
  quantity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Record usage when a request is approved
export async function recordItemUsage(
  userId: string,
  itemId: string,
  itemName: string,
  quantity: number
) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Check if a record for this month exists
  const existingRecord = await getMonthlyUsage(userId, itemId, year, month);
  
  if (existingRecord) {
    // Update existing record
    const newQuantity = existingRecord.quantity + quantity;
    await updateMonthlyUsage(existingRecord.id, newQuantity);
    return existingRecord.id;
  } else {
    // Create new record
    const newUsage = {
      userId,
      itemId,
      itemName,
      year,
      month,
      quantity,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, "monthlyUsage"), newUsage);
    return docRef.id;
  }
}

// Update monthly usage record
async function updateMonthlyUsage(id: string, newQuantity: number) {
  const usageRef = doc(db, "monthlyUsage", id);
  return await updateDoc(usageRef, { 
    quantity: newQuantity,
    updatedAt: Timestamp.now()
  });
}

// Get monthly usage for a user and item
export async function getMonthlyUsage(
  userId: string,
  itemId: string,
  year: number,
  month: number
) {
  const q = query(
    collection(db, "monthlyUsage"),
    where("userId", "==", userId),
    where("itemId", "==", itemId),
    where("year", "==", year),
    where("month", "==", month)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as MonthlyUsage;
}

// Check if a user has reached their monthly limit
export async function checkMonthlyLimit(
  userId: string,
  itemId: string,
  userPosition: string,
  requestedQuantity: number
) {
  // Get the limitation for this item and position
  const limitationsQuery = query(
    collection(db, "itemLimitations"),
    where("itemId", "==", itemId),
    where("position", "==", userPosition)
  );
  
  const limitationsSnapshot = await getDocs(limitationsQuery);
  
  // If no limitations found, allow the request
  if (limitationsSnapshot.empty) {
    return { allowed: true };
  }
  
  const limitation = { id: limitationsSnapshot.docs[0].id, ...limitationsSnapshot.docs[0].data() } as ItemLimitation;
  
  // Get current usage from already recorded monthly usage
  const now = new Date();
  const currentUsage = await getMonthlyUsage(userId, itemId, now.getFullYear(), now.getMonth() + 1);
  let currentQuantity = currentUsage ? currentUsage.quantity : 0;
  
  // IMPORTANT FIX: Also count pending and approved requests in the current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startTimestamp = Timestamp.fromDate(startOfMonth);
  
  // Get all pending and approved requests for this item in the current month
  const pendingRequestsQuery = query(
    collection(db, "requests"),
    where("employeeId", "==", userId),
    where("equipmentId", "==", itemId),
    where("createdAt", ">=", startTimestamp),
    where("status", "in", ["pending", "approved", "fulfilled"])
  );
  
  const pendingSnapshot = await getDocs(pendingRequestsQuery);
  const pendingQuantity = pendingSnapshot.docs.reduce((total, doc) => {
    return total + doc.data().quantity;
  }, 0);
  
  // Add pending quantities to current usage
  currentQuantity += pendingQuantity;
  
  // Check if request would exceed limit
  const totalAfterRequest = currentQuantity + requestedQuantity;
  
  if (totalAfterRequest > limitation.monthlyLimit) {
    return { 
      allowed: false, 
      currentUsage: currentQuantity,
      limit: limitation.monthlyLimit,
      remaining: Math.max(0, limitation.monthlyLimit - currentQuantity)
    };
  }
  
  return { 
    allowed: true,
    currentUsage: currentQuantity,
    limit: limitation.monthlyLimit,
    remaining: limitation.monthlyLimit - currentQuantity
  };
}

import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
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

// Types
export interface ItemLimitation {
  id?: string;
  itemId: string;
  itemName: string;
  position: string;
  monthlyLimit: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create a new item limitation
export async function createItemLimitation(limitation: Omit<ItemLimitation, 'id' | 'createdAt' | 'updatedAt'>) {
  const newLimitation = {
    ...limitation,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  return await addDoc(collection(db, "itemLimitations"), newLimitation);
}

// Update item limitation
export async function updateItemLimitation(id: string, limitation: Partial<ItemLimitation>) {
  const updateData = {
    ...limitation,
    updatedAt: Timestamp.now()
  };
  return await updateDoc(doc(db, "itemLimitations", id), updateData);
}

// Delete item limitation
export async function deleteItemLimitation(id: string) {
  return await deleteDoc(doc(db, "itemLimitations", id));
}

// Get all item limitations
export async function getItemLimitations() {
  const querySnapshot = await getDocs(collection(db, "itemLimitations"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ItemLimitation[];
}

// Subscribe to item limitations
export function subscribeToItemLimitations(callback: (limitations: ItemLimitation[]) => void) {
  return onSnapshot(collection(db, "itemLimitations"), (snapshot) => {
    const limitations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ItemLimitation[];
    callback(limitations);
  });
}

// Get limitations for a specific position
export async function getLimitationsByPosition(position: string) {
  const q = query(
    collection(db, "itemLimitations"),
    where("position", "==", position)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ItemLimitation[];
}

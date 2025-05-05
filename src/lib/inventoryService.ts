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
import { InventoryItem } from "@/types";

// Get all inventory items
export async function getInventory() {
  const querySnapshot = await getDocs(collection(db, "inventory"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[];
}

// Add a new inventory item
export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const newItem = {
    ...item,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  return await addDoc(collection(db, "inventory"), newItem);
}

// Update an inventory item
export async function updateInventoryItem(id: string, item: Partial<InventoryItem>) {
  const updateData = {
    ...item,
    updatedAt: Timestamp.now()
  };
  return await updateDoc(doc(db, "inventory", id), updateData);
}

// Delete an inventory item
export async function deleteInventoryItem(id: string) {
  return await deleteDoc(doc(db, "inventory", id));
}

// Subscribe to inventory changes
export function subscribeToInventory(
  callback: (items: InventoryItem[]) => void,
  filters?: {
    category?: string;
    lowStock?: boolean;
  }
) {
  let q = query(
    collection(db, "inventory"),
    orderBy("name")
  );

  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }

  if (filters?.lowStock) {
    q = query(q, where("quantity", "<=", "minQuantity"));
  }

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InventoryItem[];
    callback(items);
  });
}

// Update stock quantity
export async function updateStockQuantity(
  id: string,
  change: number,
  isRestock: boolean = false
) {
  const itemRef = doc(db, "inventory", id);
  const updateData: Partial<InventoryItem> = {
    updatedAt: Timestamp.now()
  };

  if (isRestock) {
    updateData.lastRestocked = Timestamp.now();
  }

  return await updateDoc(itemRef, {
    ...updateData,
    quantity: change
  });
}

// Get low stock items
export async function getLowStockItems() {
  const q = query(
    collection(db, "inventory"),
    where("quantity", "<=", "minQuantity")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[];
}

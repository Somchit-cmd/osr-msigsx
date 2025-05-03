import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Get all inventory items
export async function getInventory() {
  const querySnapshot = await getDocs(collection(db, "inventory"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Add a new inventory item (with base64 image)
export async function addInventoryItem(item: any) {
  return await addDoc(collection(db, "inventory"), item);
}

// Update an inventory item
export async function updateInventoryItem(id: string, item: any) {
  return await updateDoc(doc(db, "inventory", id), item);
}

// Delete an inventory item
export async function deleteInventoryItem(id: string) {
  return await deleteDoc(doc(db, "inventory", id));
}

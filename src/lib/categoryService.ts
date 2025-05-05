import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

// Get all categories (one-time fetch)
export async function getAllCategories() {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Subscribe to categories (real-time)
export function subscribeToCategories(callback: (categories: any[]) => void) {
  return onSnapshot(collection(db, "categories"), (snapshot) => {
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(categories);
  });
}

// Add a category
export async function addCategory(name: string) {
  await addDoc(collection(db, "categories"), { name });
}

// Edit a category
export async function editCategory(id: string, name: string) {
  await updateDoc(doc(db, "categories", id), { name });
}

// Remove a category
export async function removeCategory(id: string) {
  await deleteDoc(doc(db, "categories", id));
}

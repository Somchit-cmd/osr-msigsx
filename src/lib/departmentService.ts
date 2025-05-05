import { db } from "./firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

// Get all departments (one-time fetch)
export async function getAllDepartments() {
  const snapshot = await getDocs(collection(db, "departments"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Subscribe to departments (real-time)
export function subscribeToDepartments(callback: (departments: any[]) => void) {
  return onSnapshot(collection(db, "departments"), (snapshot) => {
    const departments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(departments);
  });
}

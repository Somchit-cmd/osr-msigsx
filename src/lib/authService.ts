import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import bcrypt from "bcryptjs";

export async function authenticate(employeeId: string, password: string) {
  const q = query(
    collection(db, "users"),
    where("id", "==", employeeId),
    where("password", "==", password)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const user = snapshot.docs[0].data();
    // Remove password before returning user object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

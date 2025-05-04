import { setDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import bcrypt from "bcryptjs";

// Run this script with ts-node or similar
async function createUser() {
  const id = "4020";
  const name = "Employee A";
  const password = "4020";
  const role = "employee";
  const department = "IT";

  const hashedPassword = await bcrypt.hash(password, 10);
  await setDoc(doc(db, "users", id), {
    id,
    name,
    password: hashedPassword,
    role,
    department
  });

  console.log("User created!");
}

createUser();

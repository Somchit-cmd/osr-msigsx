import { collection, getDocs, updateDoc, doc, deleteField } from "firebase/firestore";
import { db } from "../lib/firebase";

async function removeTimestampsFromUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  for (const userDoc of usersSnapshot.docs) {
    await updateDoc(doc(db, "users", userDoc.id), {
      createdAt: deleteField(),
      updatedAt: deleteField(),
    });
    console.log(`Removed timestamps from user: ${userDoc.id}`);
  }
  console.log("All timestamps removed!");
}

removeTimestampsFromUsers();

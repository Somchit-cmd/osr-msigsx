import { db } from "./firebase";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  department: string;
  position: string;
  createdAt: Date;
  updatedAt: Date;
}

// Initialize auth
const auth = getAuth();

// Sign in user
export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Get the user's document from Firestore
  const employeeId = userCredential.user.uid;
  const userDoc = await getDoc(doc(db, "users", employeeId));
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    // Add a check for the position field
    if (!userData.position) {
      // Update the user with a default position if it's missing
      await updateDoc(doc(db, "users", employeeId), { position: "" });
    }
  }
  
  return userCredential;
}

// Sign out user
export async function signOutUser() {
  return await signOut(auth);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Get user profile
export async function getUserProfile(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  return null;
}

// Create user profile
export async function createUserProfile(
  userId: string,
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
) {
  const userProfile: User = {
    id: userId,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return await setDoc(doc(db, "users", userId), userProfile);
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
) {
  return await updateDoc(doc(db, "users", userId), {
    ...userData,
    updatedAt: new Date()
  });
}

// Subscribe to user profile changes
export function subscribeToUserProfile(
  userId: string,
  callback: (user: User | null) => void
) {
  return onSnapshot(doc(db, "users", userId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as User);
    } else {
      callback(null);
    }
  });
}

// Get all users (admin only)
export async function getAllUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
}

// Subscribe to all users (admin only)
export function subscribeToAllUsers(callback: (users: User[]) => void) {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    callback(users);
  });
}

// Add a new user
export async function addUser(newUser: User) {
  await setDoc(doc(db, "users", newUser.id), {
    ...newUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Edit an existing user
export async function editUser(user) {
  const userRef = doc(db, "users", user.id);
  
  // Get current user data to preserve password if not provided
  if (!user.password) {
    const currentUser = await getDoc(userRef);
    if (currentUser.exists() && currentUser.data().password) {
      user.password = currentUser.data().password;
    }
  }
  
  await updateDoc(userRef, { ...user, updatedAt: new Date() });
}

// Remove a user
export async function removeUser(userId) {
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
} 
import { db } from "./firebase";
import { collection, doc, setDoc } from "firebase/firestore";

// Initialize collections with sample data
export async function initializeFirestore() {
  try {
    // Initialize users collection
    const usersCollection = collection(db, "users");
    
    // Sample admin user
    await setDoc(doc(usersCollection, "admin1"), {
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      department: "Administration",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Sample employee user
    await setDoc(doc(usersCollection, "emp1"), {
      email: "employee@example.com",
      name: "Employee User",
      role: "employee",
      department: "IT",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Initialize inventory collection
    const inventoryCollection = collection(db, "inventory");
    
    // Sample inventory items
    await setDoc(doc(inventoryCollection, "item1"), {
      name: "Laptop",
      description: "Dell XPS 15",
      category: "Electronics",
      quantity: 10,
      unit: "pcs",
      minQuantity: 2,
      maxQuantity: 20,
      location: "Storage Room A",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await setDoc(doc(inventoryCollection, "item2"), {
      name: "Printer",
      description: "HP LaserJet Pro",
      category: "Office Equipment",
      quantity: 5,
      unit: "pcs",
      minQuantity: 1,
      maxQuantity: 10,
      location: "Storage Room B",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Initialize requests collection
    const requestsCollection = collection(db, "requests");
    
    // Sample request
    await setDoc(doc(requestsCollection, "req1"), {
      employeeId: "emp1",
      employeeName: "Employee User",
      department: "IT",
      equipmentId: "item1",
      equipmentName: "Laptop",
      quantity: 1,
      status: "pending",
      priority: "medium",
      notes: "Need for new project",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Firestore collections initialized successfully!");
    return true;
  } catch (error) {
    console.error("Error initializing Firestore:", error);
    return false;
  }
} 
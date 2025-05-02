
import { Department, Employee, Equipment, EquipmentRequest, InventoryItem, RequestStatus } from "@/types";

export const departments: Department[] = [
  { id: "dept-1", name: "Marketing" },
  { id: "dept-2", name: "Engineering" },
  { id: "dept-3", name: "Finance" },
  { id: "dept-4", name: "Human Resources" },
  { id: "dept-5", name: "Operations" },
];

export const employees: Employee[] = [
  { id: "emp-1", name: "John Smith", department: "dept-2", role: "employee" },
  { id: "emp-2", name: "Sarah Johnson", department: "dept-1", role: "employee" },
  { id: "emp-3", name: "Michael Brown", department: "dept-3", role: "employee" },
  { id: "emp-4", name: "Emily Davis", department: "dept-4", role: "employee" },
  { id: "emp-5", name: "David Wilson", department: "dept-5", role: "employee" },
  { id: "emp-6", name: "Jessica Taylor", department: "dept-2", role: "admin" },
  { id: "emp-7", name: "Robert Martinez", department: "dept-1", role: "employee" },
  { id: "emp-8", name: "Lisa Thomas", department: "dept-3", role: "supervisor" },
];

export const equipments: Equipment[] = [
  {
    id: "equip-1",
    name: "Laptop",
    category: "Electronics",
    description: "High-performance laptop for presentations and work",
    available: 8,
    image: "/laptop.png",
  },
  {
    id: "equip-2",
    name: "Projector",
    category: "Presentation",
    description: "HD projector for meetings and presentations",
    available: 4,
    image: "/projector.png",
  },
  {
    id: "equip-3",
    name: "Wireless Microphone",
    category: "Electronics",
    description: "Professional wireless microphone for events",
    available: 7,
    image: "/microphone.png",
  },
  {
    id: "equip-4",
    name: "Digital Camera",
    category: "Electronics",
    description: "High-resolution camera for documentation",
    available: 2,
    image: "/camera.png",
  },
  {
    id: "equip-5",
    name: "Whiteboard",
    category: "Office Supplies",
    description: "Portable whiteboard for brainstorming sessions",
    available: 6,
    image: "/whiteboard.png",
  },
  {
    id: "equip-6",
    name: "Office Chair",
    category: "Furniture",
    description: "Ergonomic office chair for temporary use",
    available: 12,
    image: "/chair.png",
  },
  {
    id: "equip-7",
    name: "Tablet",
    category: "Electronics",
    description: "Tablet for mobile presentations and note-taking",
    available: 5,
    image: "/tablet.png",
  },
  {
    id: "equip-8",
    name: "Printer",
    category: "Office Supplies",
    description: "Color laser printer for documents",
    available: 2,
    image: "/printer.png",
  },
];

export const inventoryItems: InventoryItem[] = equipments.map(equip => ({
  ...equip,
  totalStock: equip.available + Math.floor(Math.random() * 10),
  reserved: Math.floor(Math.random() * 5),
  lowStockThreshold: 3,
}));

const getRandomDate = (start: Date, end: Date): string => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString();
};

const getRandomStatus = (): RequestStatus => {
  const statuses: RequestStatus[] = ['pending', 'approved', 'rejected', 'fulfilled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

export const equipmentRequests: EquipmentRequest[] = Array.from({ length: 20 }, (_, i) => {
  const employeeIndex = Math.floor(Math.random() * employees.length);
  const equipmentIndex = Math.floor(Math.random() * equipments.length);
  const status = getRandomStatus();
  const requestDate = getRandomDate(new Date('2023-01-01'), new Date());
  
  return {
    id: `req-${i + 1}`,
    employeeName: employees[employeeIndex].name,
    department: departments.find(d => d.id === employees[employeeIndex].department)?.name || '',
    equipmentId: equipments[equipmentIndex].id,
    equipmentName: equipments[equipmentIndex].name,
    quantity: Math.floor(Math.random() * 3) + 1,
    notes: Math.random() > 0.5 ? `Need this for the upcoming project` : undefined,
    status,
    requestDate,
    approvalDate: ['approved', 'rejected', 'fulfilled'].includes(status) ? getRandomDate(new Date(requestDate), new Date()) : undefined,
    fulfillmentDate: status === 'fulfilled' ? getRandomDate(new Date(requestDate), new Date()) : undefined,
    adminNotes: Math.random() > 0.7 ? 'Approved based on availability' : undefined,
  };
});

export const currentUser = {
  id: "emp-1",
  name: "John Smith",
  email: "john.smith@company.com",
  role: "employee",
  departmentId: "dept-2",
};

export const getDashboardStats = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const requestsToday = equipmentRequests.filter(
    req => new Date(req.requestDate).toDateString() === today.toDateString()
  ).length;

  const requestsThisWeek = equipmentRequests.filter(
    req => new Date(req.requestDate) >= weekAgo
  ).length;

  const lowStockItems = inventoryItems.filter(
    item => item.available <= item.lowStockThreshold
  ).length;

  const pendingRequests = equipmentRequests.filter(
    req => req.status === 'pending'
  ).length;

  return {
    requestsToday,
    requestsThisWeek,
    lowStockItems,
    pendingRequests,
    totalItems: inventoryItems.length,
    totalRequests: equipmentRequests.length,
  };
};

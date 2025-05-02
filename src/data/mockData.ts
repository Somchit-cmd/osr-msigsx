
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
    name: "Printer Paper",
    category: "Paper Products",
    description: "Standard white letter-size printer paper (500 sheets)",
    available: 25,
    image: "/paper.png",
  },
  {
    id: "equip-2",
    name: "Notebooks",
    category: "Writing Supplies",
    description: "Spiral-bound lined notebooks (100 pages)",
    available: 35,
    image: "/notebook.png",
  },
  {
    id: "equip-3",
    name: "Ballpoint Pens",
    category: "Writing Supplies",
    description: "Black and blue medium-point ballpoint pens",
    available: 120,
    image: "/pens.png",
  },
  {
    id: "equip-4",
    name: "Staplers",
    category: "Desk Accessories",
    description: "Standard desktop staplers with staples",
    available: 8,
    image: "/stapler.png",
  },
  {
    id: "equip-5",
    name: "Paperclips",
    category: "Desk Accessories",
    description: "Small and large metal paperclips (box of 100)",
    available: 45,
    image: "/paperclips.png",
  },
  {
    id: "equip-6",
    name: "File Folders",
    category: "Organization",
    description: "Manila file folders (letter size, pack of 25)",
    available: 30,
    image: "/folders.png",
  },
  {
    id: "equip-7",
    name: "Sticky Notes",
    category: "Paper Products",
    description: "Assorted color sticky notes (3x3 inch pads)",
    available: 52,
    image: "/stickynotes.png",
  },
  {
    id: "equip-8",
    name: "Whiteboard Markers",
    category: "Writing Supplies",
    description: "Dry erase markers in assorted colors",
    available: 63,
    image: "/markers.png",
  },
];

export const inventoryItems: InventoryItem[] = equipments.map(equip => ({
  ...equip,
  totalStock: equip.available + Math.floor(Math.random() * 20),
  reserved: Math.floor(Math.random() * 5),
  lowStockThreshold: 10,
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
    quantity: Math.floor(Math.random() * 5) + 1,
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

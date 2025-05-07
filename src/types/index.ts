export type Equipment = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
};

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';

export type EquipmentRequest = {
  id: string;
  employeeName: string;
  department: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  notes?: string;
  status: RequestStatus;
  requestDate: string;
  approvalDate?: string;
  fulfillmentDate?: string;
  adminNotes?: string;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  fulfilledAt?: any;
};

export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  name: string;
  department: string;
  role: 'employee' | 'admin';
};

export type InventoryItem = Equipment & {
  available: number;
  totalStock: number;
  reserved: number;
  lowStockThreshold: number;
  minQuantity: number;
  updatedAt: any;
  createdAt: any;
  lastRestocked?: any;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  departmentId: string;
};

export type FilterParams = {
  startDate?: string;
  endDate?: string;
  department?: string;
  employee?: string;
  status?: RequestStatus;
  category?: string;
};

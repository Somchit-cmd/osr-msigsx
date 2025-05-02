
export type Equipment = {
  id: string;
  name: string;
  category: string;
  description: string;
  available: number;
  image: string;
};

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

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
};

export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  name: string;
  department: string;
  role: 'employee' | 'admin' | 'supervisor';
};

export type InventoryItem = Equipment & {
  totalStock: number;
  reserved: number;
  lowStockThreshold: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin' | 'supervisor';
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

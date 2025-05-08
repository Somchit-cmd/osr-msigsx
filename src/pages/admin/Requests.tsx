import { useEffect, useState } from "react";
import { subscribeToAllRequests } from "@/lib/requestService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequestTable from "@/components/RequestTable";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { FilterParams } from "@/types";
import { subscribeToDepartments } from "@/lib/departmentService";
import { doc, updateDoc, Timestamp, getDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

const AdminRequests = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const unsubscribe = subscribeToAllRequests(setRequests);
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    const unsubscribe = subscribeToDepartments(setDepartments);
    return () => unsubscribe();
  }, []);
  
  // Filter requests based on the active tab, search query, and filters
  const filteredRequests = requests.filter(request => {
    // Filter by status tab
    const matchesStatus = activeTab === "all" || request.status === activeTab;
    
    // Filter by search query (employee name or equipment name)
    const matchesSearch = 
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.equipmentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by department if selected
    const matchesDepartment = 
      !filters.department || request.department === filters.department;
    
    return matchesStatus && matchesSearch && matchesDepartment;
  });
  
  // Get counts for tabs
  const allCount = requests.length;
  const pendingCount = requests.filter(req => req.status === "pending").length;
  const approvedCount = requests.filter(req => req.status === "approved").length;
  const rejectedCount = requests.filter(req => req.status === "rejected").length;
  const fulfilledCount = requests.filter(req => req.status === "fulfilled").length;
  
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  // Reset to page 1 when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filters, requests]);
  
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'fulfill') => {
    const statusMap = {
      approve: "approved",
      reject: "rejected",
      fulfill: "fulfilled"
    };
    let update: any = { status: statusMap[action] };
    if (action === "approve") update.approvedAt = Timestamp.now();
    if (action === "fulfill") update.fulfilledAt = Timestamp.now();

    // 1. Get the request document to find the equipment/item id and quantity
    const requestRef = doc(db, "requests", id);
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.data();

    // 2. If approving or fulfilling, decrease the inventory
    if (action === "fulfill" && requestData) {
      const equipmentId = requestData.equipmentId;
      const quantityRequested = requestData.quantity;

      if (equipmentId && quantityRequested) {
        const equipmentRef = doc(db, "inventory", equipmentId);
        const equipmentSnap = await getDoc(equipmentRef);
        const equipmentData = equipmentSnap.data();
        if (equipmentData) {
          const newAvailable = (equipmentData.available || 0) - quantityRequested;
          await updateDoc(equipmentRef, { available: newAvailable });
        }
      }
    }

    // 3. Update the request status as before
    await updateDoc(requestRef, update);

    // NEW: Add notification for the user
    const userId = requestData.userId || requestData.employeeId;
    if (userId) {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: `request_${statusMap[action]}`,
        requestId: id,
        message: `Your request #${id} was ${statusMap[action]}.`,
        read: false,
        createdAt: Timestamp.now()
      });
    }

    toast({
      title: `Request ${statusMap[action]}`,
      description: `Request #${id} has been ${statusMap[action]} successfully.`,
    });
  };
  
  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };
  
  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Manage Supply Requests</h1>
        <p className="text-text-muted mb-8">Review and process office supply requests</p>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5 h-auto mb-6">
            <TabsTrigger value="all" className="px-4 py-2">
              All ({allCount})
            </TabsTrigger>
            <TabsTrigger value="pending" className="px-4 py-2">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved" className="px-4 py-2">
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="px-4 py-2">
              Rejected ({rejectedCount})
            </TabsTrigger>
            <TabsTrigger value="fulfilled" className="px-4 py-2">
              Fulfilled ({fulfilledCount})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee or supply name..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 md:flex-none md:w-64">
              <Select
                value={filters.department || "all"}
                onValueChange={(value) => handleFilterChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
          
          <TabsContent value={activeTab}>
            <RequestTable 
              requests={paginatedRequests} 
              isAdmin={true}
              onAction={handleAction}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminRequests;

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
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const AdminRequests = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  
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
  
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'fulfill') => {
    let update: any = { status: action };
    if (action === "approve") update.approvedAt = Timestamp.now();
    if (action === "fulfill") update.fulfilledAt = Timestamp.now();

    await updateDoc(doc(db, "requests", id), update);

    toast({
      title: `Request ${action}d`,
      description: `Request #${id} has been ${action}d successfully.`,
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
              requests={filteredRequests} 
              isAdmin={true}
              onAction={handleAction}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminRequests;

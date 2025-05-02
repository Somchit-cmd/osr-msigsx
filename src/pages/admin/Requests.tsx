
import { useState } from "react";
import { equipmentRequests } from "@/data/mockData";
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

const AdminRequests = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  
  // Filter requests based on the active tab, search query, and filters
  const filteredRequests = equipmentRequests.filter(request => {
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
  const allCount = equipmentRequests.length;
  const pendingCount = equipmentRequests.filter(req => req.status === "pending").length;
  const approvedCount = equipmentRequests.filter(req => req.status === "approved").length;
  const rejectedCount = equipmentRequests.filter(req => req.status === "rejected").length;
  const fulfilledCount = equipmentRequests.filter(req => req.status === "fulfilled").length;
  
  // Get unique departments for filtering
  const departments = [...new Set(equipmentRequests.map(req => req.department))];
  
  const handleAction = (id: string, action: 'approve' | 'reject' | 'fulfill') => {
    toast({
      title: `Request ${action}ed`,
      description: `Request #${id} has been ${action}ed successfully.`,
    });
    
    // In a real app, we would update the request in the database
    // and then refresh the data
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
        <h1 className="text-3xl font-bold mb-2">Manage Requests</h1>
        <p className="text-text-muted mb-8">Review and process equipment requests</p>
        
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
                placeholder="Search by employee or equipment..."
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
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-12 bg-white border rounded-md">
                <p className="text-lg text-text-muted">No requests found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminRequests;

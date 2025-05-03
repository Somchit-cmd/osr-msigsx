import { useState } from "react";
import { equipmentRequests } from "@/data/mockData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, BarChart, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStatusBadgeClass, formatDate } from "@/utils/helpers";
import { departments } from "@/data/mockData";

const AdminReports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("daily");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [department, setDepartment] = useState("all");
  
  // Function to generate report data for exports
  const generateReport = () => {
    toast({
      title: "Report generated",
      description: `Report for ${activeTab} activity has been exported successfully.`,
    });
  };
  
  // Filter requests based on date range and department
  const filteredRequests = equipmentRequests.filter(request => {
    const requestDate = new Date(request.requestDate);
    const filterStartDate = startDate ? new Date(startDate) : new Date(0);
    const filterEndDate = endDate ? new Date(endDate) : new Date();
    
    const matchesDateRange = 
      requestDate >= filterStartDate && 
      requestDate <= filterEndDate;
    
    const matchesDepartment = 
      department === "all" || request.department === department;
    
    return matchesDateRange && matchesDepartment;
  });
  
  // Calculate statistics
  const totalRequests = filteredRequests.length;
  const approvedRequests = filteredRequests.filter(r => r.status === 'approved' || r.status === 'fulfilled').length;
  const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected').length;
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending').length;
  
  // Generate data for charts
  const departmentData = departments.map(dept => {
    const count = filteredRequests.filter(r => r.department === dept.name).length;
    return { name: dept.name, value: count };
  }).filter(d => d.value > 0);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-text-muted mb-8">Generate and export equipment disbursement reports</p>
        
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Tabs 
              defaultValue="daily" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1"
            >
              <TabsList className="grid grid-cols-4 h-10 w-full md:w-[400px]">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              onClick={generateReport}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              <Download className="h-4 w-4 mr-2" /> Export Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Department
              </label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" /> Apply Filters
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1">{totalRequests}</div>
                <div className="text-sm text-text-muted">Total Requests</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1 text-green-600">{approvedRequests}</div>
                <div className="text-sm text-text-muted">Approved/Fulfilled</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1 text-yellow-600">{pendingRequests}</div>
                <div className="text-sm text-text-muted">Pending</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1 text-red-600">{rejectedRequests}</div>
                <div className="text-sm text-text-muted">Rejected</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" /> Requests by Department
                </CardTitle>
                <CardDescription>
                  Distribution of equipment requests by department
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Chart visualization would appear here</p>
                  <p className="text-sm mt-2">
                    {departmentData.map(d => `${d.name}: ${d.value}`).join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" /> Request Status Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of requests by status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Chart visualization would appear here</p>
                  <p className="text-sm mt-2">
                    Approved: {approvedRequests}, Pending: {pendingRequests}, Rejected: {rejectedRequests}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Detailed Request Data</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-gray-100 font-bold">Date</TableHead>
                    <TableHead className="bg-gray-100 font-bold">Employee</TableHead>
                    <TableHead className="bg-gray-100 font-bold">Department</TableHead>
                    <TableHead className="bg-gray-100 font-bold">Equipment</TableHead>
                    <TableHead className="bg-gray-100 font-bold">Quantity</TableHead>
                    <TableHead className="text-center bg-gray-100 font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        No data available for the selected filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.slice(0, 10).map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{formatDate(request.requestDate)}</TableCell>
                        <TableCell>{request.employeeName}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{request.equipmentName}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={getStatusBadgeClass(request.status)}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {filteredRequests.length > 10 && (
                <div className="p-4 text-center">
                  <Button variant="outline" className="text-brand-blue">
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminReports;

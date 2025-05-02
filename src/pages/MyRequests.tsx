
import { useState } from "react";
import { equipmentRequests } from "@/data/mockData";
import { currentUser } from "@/data/mockData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequestTable from "@/components/RequestTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyRequests = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter requests for the current user
  // In a real app, we would fetch this from an API
  const userRequests = equipmentRequests.filter(request => 
    request.employeeName === currentUser.name
  );
  
  const filteredRequests = activeTab === "all" 
    ? userRequests 
    : userRequests.filter(request => request.status === activeTab);
  
  const pendingCount = userRequests.filter(req => req.status === "pending").length;
  const approvedCount = userRequests.filter(req => req.status === "approved").length;
  const rejectedCount = userRequests.filter(req => req.status === "rejected").length;
  const fulfilledCount = userRequests.filter(req => req.status === "fulfilled").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Supply Requests</h1>
        <p className="text-text-muted mb-8">Track and manage your office supply requests</p>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-5 h-auto mb-6">
            <TabsTrigger value="all" className="px-4 py-2">
              All ({userRequests.length})
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
          
          <TabsContent value={activeTab}>
            <RequestTable requests={filteredRequests} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyRequests;

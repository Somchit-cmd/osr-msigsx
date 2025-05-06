import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequestTable from "@/components/RequestTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subscribeToUserRequests } from "@/lib/requestService";

const user =
  JSON.parse(sessionStorage.getItem("user") || "null") ||
  JSON.parse(localStorage.getItem("user") || "null");

const MyRequests = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [myRequests, setMyRequests] = useState([]);
  
  // Use myRequests from Firestore for filtering and counts
  const filteredRequests = activeTab === "all"
    ? myRequests
    : myRequests.filter(request => request.status === activeTab);
  
  const pendingCount = myRequests.filter(req => req.status === "pending").length;
  const approvedCount = myRequests.filter(req => req.status === "approved").length;
  const rejectedCount = myRequests.filter(req => req.status === "rejected").length;
  const fulfilledCount = myRequests.filter(req => req.status === "fulfilled").length;

  useEffect(() => {
    console.log("Current user object:", user); // Debug log for full user object

    if (!user) {
      console.log("No user found, returning early");
      return;
    }

    // Check if we have the correct user ID
    if (!user.id) {
      console.error("No user ID found in user object:", user);
      return;
    }
    
    console.log("Using user ID for subscription:", user.id);
    
    // Subscribe to real-time updates for user's requests
    const unsubscribe = subscribeToUserRequests(user.id, (requests) => {
      console.log("Received requests update:", requests);
      setMyRequests(requests);
    });

    // Cleanup subscription on component unmount
    return () => {
      console.log("Cleaning up subscription");
      unsubscribe();
    };
  }, [user]);

  // Debug log for current requests
  useEffect(() => {
    console.log("Current requests state:", myRequests);
  }, [myRequests]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Requests</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({myRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled ({fulfilledCount})</TabsTrigger>
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

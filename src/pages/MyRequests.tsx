import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequestTable from "@/components/RequestTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    if (!user) return;
    const fetchRequests = async () => {
      const q = query(
        collection(db, "requests"),
        where("employeeId", "==", user.id)
      );
      const snap = await getDocs(q);
      setMyRequests(
        snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as { id: string, createdAt: { toDate: () => Date } | { seconds: number, nanoseconds: number } }))
          .sort((a, b) => {
            const aTime = 'toDate' in a.createdAt ? a.createdAt.toDate().getTime() : new Date(a.createdAt.seconds * 1000).getTime();
            const bTime = 'toDate' in b.createdAt ? b.createdAt.toDate().getTime() : new Date(b.createdAt.seconds * 1000).getTime();
            return bTime - aTime; // Newest first
          })
      );
    };
    fetchRequests();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Supply Requests</h1>
        <p className="text-text-muted mb-8">Track and manage your office supply requests</p>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-5 h-auto mb-6">
            <TabsTrigger value="all" className="px-4 py-2">
              All ({myRequests.length})
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

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequestTable from "@/components/RequestTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subscribeToUserRequests } from "@/lib/requestService";
import Pagination from "@/components/Pagination";
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 10;

const MyRequests = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [myRequests, setMyRequests] = useState([]);
  const [user, setUser] = useState(() =>
    JSON.parse(sessionStorage.getItem("user") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use myRequests from Firestore for filtering and counts
  const filteredRequests = activeTab === "all"
    ? myRequests
    : myRequests.filter(request => request.status === activeTab);
  
  const pendingCount = myRequests.filter(req => req.status === "pending").length;
  const approvedCount = myRequests.filter(req => req.status === "approved").length;
  const rejectedCount = myRequests.filter(req => req.status === "rejected").length;
  const fulfilledCount = myRequests.filter(req => req.status === "fulfilled").length;

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, myRequests]);

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

  useEffect(() => {
    // Update user state if storage changes (e.g., after login/logout)
    const handleStorage = () => {
      setUser(
        JSON.parse(sessionStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null")
      );
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('myRequests.title')}</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">{t('myRequests.all', {count: myRequests.length})}</TabsTrigger>
            <TabsTrigger value="pending">{t('myRequests.pending', {count: pendingCount})}</TabsTrigger>
            <TabsTrigger value="approved">{t('myRequests.approved', {count: approvedCount})}</TabsTrigger>
            <TabsTrigger value="rejected">{t('myRequests.rejected', {count: rejectedCount})}</TabsTrigger>
            <TabsTrigger value="fulfilled">{t('myRequests.fulfilled', {count: fulfilledCount})}</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <RequestTable requests={paginatedRequests} />
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

export default MyRequests;

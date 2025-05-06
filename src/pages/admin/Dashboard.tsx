import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import RequestTable from "@/components/RequestTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  equipmentRequests,
  getDashboardStats,
  inventoryItems,
} from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight,
  Clock,
  ClipboardList,
  Database,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { subscribeToInventory } from "@/lib/inventoryService";

const AdminDashboard = () => {
  const { toast } = useToast();
  const stats = getDashboardStats();
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToInventory(setInventoryItems);
    return () => unsubscribe();
  }, []);

  const lowStockItems = inventoryItems
    .filter((item) => item.available <= item.minQuantity)
    .slice(0, 5);

  // Get only pending requests
  const pendingRequests = equipmentRequests
    .filter((request) => request.status === "pending")
    .slice(0, 5); // Only show 5 most recent

  const handleAction = (
    id: string,
    action: "approve" | "reject" | "fulfill"
  ) => {
    toast({
      title: `Request ${action}ed`,
      description: `Request #${id} has been ${action}ed successfully.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-text-muted mb-8">
          Overview of office supply requests and inventory
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Requests Today"
            value={stats.requestsToday}
            trend={{ value: "+25%", positive: true }}
            icon={<ClipboardList size={24} />}
          />
          <StatCard
            title="Requests This Week"
            value={stats.requestsThisWeek}
            trend={{ value: "+12%", positive: true }}
            icon={<ArrowUpRight size={24} />}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingRequests}
            icon={<Clock size={24} />}
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon={<AlertTriangle size={24} />}
            className={
              stats.lowStockItems > 0 ? "border-red-200 bg-red-50" : ""
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>
                Office supplies that need restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  All items have sufficient stock
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-red-600 font-medium">
                          {item.available}/{item.totalStock}
                        </span>
                      </div>
                      <Progress
                        value={(item.available / item.totalStock) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Recent supply requests requiring approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestTable
                requests={pendingRequests}
                isAdmin={true}
                onAction={handleAction}
              />
              {pendingRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending requests available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

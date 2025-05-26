import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
import { subscribeToAllRequests } from "@/lib/requestService";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import { useFCMToken } from "@/hooks/useFCMToken"; // adjust the import path if needed

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    requestsToday: 0,
    requestsThisWeek: 0,
    pendingRequests: 0,
    lowStockItems: 0,
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [trend, setTrend] = useState({
    requestsToday: { value: "+0%", positive: true, label: "from yesterday" },
    requestsThisWeek: { value: "+0%", positive: true },
    // ...other trends
  });

  useFCMToken(); // Only runs for admins

  useEffect(() => {
    const fetchStatsAndTrends = async () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfToday.getDate() - 1);

      // Requests Today
      const qToday = query(
        collection(db, "requests"),
        where("createdAt", ">=", Timestamp.fromDate(startOfToday))
      );
      const todaySnap = await getDocs(qToday);

      // Requests Yesterday
      const qYesterday = query(
        collection(db, "requests"),
        where("createdAt", ">=", Timestamp.fromDate(startOfYesterday)),
        where("createdAt", "<", Timestamp.fromDate(startOfToday))
      );
      const yesterdaySnap = await getDocs(qYesterday);

      // Calculate trend
      const todayCount = todaySnap.size;
      const yesterdayCount = yesterdaySnap.size;
      let percent = 0;
      let positive = true;
      if (yesterdayCount === 0) {
        percent = todayCount > 0 ? 100 : 0;
        positive = todayCount > 0;
      } else {
        percent = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
        positive = percent >= 0;
      }
      setStats((prev) => ({
        ...prev,
        requestsToday: todayCount,
      }));
      setTrend((prev) => ({
        ...prev,
        requestsToday: {
          value: `${percent > 0 ? "+" : ""}${percent.toFixed(0)}%`,
          positive,
          label: "from yesterday",
        },
      }));
    };

    fetchStatsAndTrends();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const qToday = query(
        collection(db, "requests"),
        where("createdAt", ">=", Timestamp.fromDate(startOfToday))
      );
      const todaySnap = await getDocs(qToday);

      const qWeek = query(
        collection(db, "requests"),
        where("createdAt", ">=", Timestamp.fromDate(startOfWeek))
      );
      const weekSnap = await getDocs(qWeek);

      const qPending = query(
        collection(db, "requests"),
        where("status", "==", "pending")
      );
      const pendingSnap = await getDocs(qPending);

      const inventorySnap = await getDocs(collection(db, "inventory"));
      const lowStock = inventorySnap.docs.filter(
        (doc) => doc.data().available <= doc.data().minQuantity
      );

      setStats({
        requestsToday: todaySnap.size,
        requestsThisWeek: weekSnap.size,
        pendingRequests: pendingSnap.size,
        lowStockItems: lowStock.length,
      });
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToInventory(setInventoryItems);
    const unsubscribeRequests = subscribeToAllRequests(setRequests);
    return () => {
      unsubscribe();
      unsubscribeRequests();
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const requestsToday = requests.filter(req => {
      const createdAt = req.createdAt?.toDate ? req.createdAt.toDate() : req.createdAt;
      return createdAt >= startOfToday;
    }).length;

    const requestsThisWeek = requests.filter(req => {
      const createdAt = req.createdAt?.toDate ? req.createdAt.toDate() : req.createdAt;
      return createdAt >= startOfWeek;
    }).length;

    const pendingRequests = requests.filter(req => req.status === "pending").length;

    const lowStockItems = inventoryItems.filter(item => item.available <= item.minQuantity).length;

    setStats({
      requestsToday,
      requestsThisWeek,
      pendingRequests,
      lowStockItems,
    });
  }, [requests, inventoryItems]);

  const lowStockItems = inventoryItems
    .filter((item) => item.available <= item.minQuantity)
    .slice(0, 5);

  // Get only pending requests
  const pendingRequests = requests
    .filter((request) => request.status === "pending")
    .slice(0, 5); // Only show 5 most recent

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "fulfill"
  ) => {
    const statusMap = {
      approve: "approved",
      reject: "rejected",
      fulfill: "fulfilled"
    };
    let update: any = { status: statusMap[action] };
    if (action === "approve") update.approvedAt = Timestamp.now();
    if (action === "fulfill") update.fulfilledAt = Timestamp.now();

    await updateDoc(doc(db, "requests", id), update);

    toast({
      title: t(`adminDashboard.requestActions.${statusMap[action]}Title`),
      description: t(`adminDashboard.requestActions.${statusMap[action]}Description`, {id}),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{t('adminDashboard.title')}</h1>
        <p className="text-text-muted mb-8">
          {t('adminDashboard.overview')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('adminDashboard.requestsToday')}
            value={stats.requestsToday}
            trend={trend.requestsToday}
            icon={<ClipboardList size={24} />}
          />
          <StatCard
            title={t('adminDashboard.requestsThisWeek')}
            value={stats.requestsThisWeek}
            trend={trend.requestsThisWeek}
            icon={<ArrowUpRight size={24} />}
          />
          <StatCard
            title={t('adminDashboard.pendingApprovals')}
            value={stats.pendingRequests}
            icon={<Clock size={24} />}
          />
          <StatCard
            title={t('adminDashboard.lowStockItems')}
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
              <CardTitle>{t('adminDashboard.lowStockAlert.title')}</CardTitle>
              <CardDescription>
                {t('adminDashboard.lowStockAlert.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('adminDashboard.lowStockAlert.sufficientStock')}
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
              <CardTitle>{t('adminDashboard.recentRequests.title')}</CardTitle>
              <CardDescription>
                {t('adminDashboard.recentRequests.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestTable
                requests={pendingRequests}
                isAdmin={true}
                onAction={handleAction}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

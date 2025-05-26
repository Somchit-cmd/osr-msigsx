import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStatusBadgeClass, formatDate } from "@/utils/helpers";
import { subscribeToAllRequests } from "@/lib/requestService";
import { subscribeToDepartments } from "@/lib/departmentService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Pagination from "@/components/Pagination";
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as ReBarChart, Bar, XAxis, YAxis } from 'recharts';
import Papa from "papaparse";

const PAGE_SIZE = 10;

const AdminReports = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("daily");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [department, setDepartment] = useState("all");
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAllRequests(setRequests);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToDepartments(setDepartments);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === "daily") {
      const today = new Date();
      setStartDate(today.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (activeTab === "weekly") {
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      setStartDate(firstDayOfWeek.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (activeTab === "monthly") {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
    // For "custom", do not change the dates
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, startDate, endDate, department, requests]);

  function getReportFileName() {
    if (activeTab === "daily") {
      return `equipment-requests-daily-${startDate}.csv`;
    }
    if (activeTab === "weekly") {
      return `equipment-requests-weekly-${startDate}_to_${endDate}.csv`;
    }
    if (activeTab === "monthly") {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      return `equipment-requests-monthly-${year}-${month}.csv`;
    }
    // Custom
    return `equipment-requests-custom-${startDate}_to_${endDate}.csv`;
  }

  // Function to generate report data for exports
  const generateReport = () => {
    if (filteredRequests.length === 0) {
      toast({
        title: t('reports.noDataToExport'),
        description: t('reports.noDataForFilters'),
        variant: "destructive",
      });
      return;
    }

    // Prepare data for CSV
    const csvData = filteredRequests.map(req => ({
      "Request Date": formatDate(req.createdAt?.toDate?.() || req.createdAt),
      "Employee": req.employeeName,
      "Department": req.department,
      "Equipment": req.equipmentName,
      "Quantity": req.quantity,
      "Notes": req.notes || "",
      "Status": req.status,
      "Approval Date": req.approvedAt ? formatDate(req.approvedAt?.toDate?.() || req.approvedAt) : "",
      "Fulfillment Date": req.fulfilledAt ? formatDate(req.fulfilledAt?.toDate?.() || req.fulfilledAt) : "",
      "Admin Notes": req.adminNotes || "",
    }));

    const csv = Papa.unparse(csvData);

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", getReportFileName());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: t('reports.reportExported'),
      description: t('reports.exportSuccess', {period: t(`reports.periods.${activeTab}`)}),
    });
  };

  // Filter requests based on date range and department
  const filteredRequests = requests.filter((request) => {
    // Convert Firestore Timestamp to Date
    const requestDate = request.createdAt.toDate();

    // Parse start and end dates, and set time to cover the full day
    const filterStartDate = startDate
      ? new Date(`${startDate}T00:00:00`)
      : new Date(0);
    const filterEndDate = endDate
      ? new Date(`${endDate}T23:59:59`)
      : new Date();

    const matchesDateRange =
      requestDate >= filterStartDate && requestDate <= filterEndDate;

    const matchesDepartment =
      department === "all" || request.department === department;

    return matchesDateRange && matchesDepartment;
  });

  // Calculate statistics
  const totalRequests = filteredRequests.length;
  const approvedOnly = filteredRequests.filter(r => r.status === "approved").length;
  const pendingOnly = filteredRequests.filter(r => r.status === "pending").length;
  const rejectedOnly = filteredRequests.filter(r => r.status === "rejected").length;
  const fulfilledOnly = filteredRequests.filter(r => r.status === "fulfilled").length;

  // Generate data for charts
  const departmentData = departments
    .map((dept) => {
      const count = filteredRequests.filter(
        (r) => r.department === dept.name
      ).length;
      return { name: dept.name, value: count };
    })
    .filter((d) => d.value > 0);

  const statusDataRaw = [
    { name: "Approved", value: approvedOnly },
    { name: "Pending", value: pendingOnly },
    { name: "Rejected", value: rejectedOnly },
    { name: "Fulfilled", value: fulfilledOnly },
  ];

  // Only include statuses with value > 0
  const statusData = statusDataRaw.filter(d => d.value > 0);

  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{t('reports.title')}</h1>
        <p className="text-text-muted mb-8">
          {t('reports.description')}
        </p>

        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Tabs
              defaultValue="daily"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1"
            >
              <TabsList className="grid grid-cols-4 h-10 w-full md:w-[400px]">
                <TabsTrigger value="daily">{t('reports.periods.daily')}</TabsTrigger>
                <TabsTrigger value="weekly">{t('reports.periods.weekly')}</TabsTrigger>
                <TabsTrigger value="monthly">{t('reports.periods.monthly')}</TabsTrigger>
                <TabsTrigger value="custom">{t('reports.periods.custom')}</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              onClick={generateReport}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              <Download className="h-4 w-4 mr-2" /> {t('reports.exportReport')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {activeTab === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">
                    {t('reports.startDate')}
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">
                    {t('reports.endDate')}
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                {t('reports.department')}
              </label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.allDepartments')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allDepartments')}</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1">{totalRequests}</div>
                <div className="text-sm text-text-muted">{t('reports.totalRequests')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1 text-green-600">
                  {approvedOnly}
                </div>
                <div className="text-sm text-text-muted">
                  {t('reports.approvedFulfilled')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1 text-yellow-600">
                  {pendingOnly}
                </div>
                <div className="text-sm text-text-muted">{t('reports.pending')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl font-bold mb-1 text-red-600">
                  {rejectedOnly}
                </div>
                <div className="text-sm text-text-muted">{t('reports.rejected')}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RePieChart className="h-5 w-5 mr-2" /> {t('reports.byDepartment.title')}
                </CardTitle>
                <CardDescription>
                  {t('reports.byDepartment.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                {departmentData.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p>{t('reports.noData')}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={departmentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#2563eb", "#10b981", "#f59e42", "#ef4444", "#a21caf", "#fbbf24", "#6366f1"][index % 7]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" /> {t('reports.byStatus.title')}
                </CardTitle>
                <CardDescription>
                  {t('reports.byStatus.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                {statusData.every(d => d.value === 0) ? (
                  <div className="text-center text-gray-500">
                    <p>{t('reports.noData')}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${t(`reports.statuses.${name.toLowerCase()}`)} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={`cell-status-${index}`}
                            fill={["#22c55e", "#fbbf24", "#ef4444", "#2563eb"][index]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t('reports.detailedData')}
            </h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.requestDate')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.employee')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.department')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.equipment')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.quantity')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.notes')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.status')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.approvalDate')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.fulfillmentDate')}
                    </TableHead>
                    <TableHead className="bg-gray-100 font-bold">
                      {t('reports.table.adminNotes')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-10 text-gray-500"
                      >
                        {t('reports.noDataForFilters')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {formatDate(
                            request.createdAt?.toDate?.() || request.createdAt
                          )}
                        </TableCell>
                        <TableCell>{request.employeeName}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{request.equipmentName}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{request.notes || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(request.status)}
                          >
                            {t(`reports.statuses.${request.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.approvedAt
                            ? formatDate(
                                request.approvedAt?.toDate?.() ||
                                  request.approvedAt
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {request.fulfilledAt
                            ? formatDate(
                                request.fulfilledAt?.toDate?.() ||
                                  request.fulfilledAt
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>{request.adminNotes || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminReports;

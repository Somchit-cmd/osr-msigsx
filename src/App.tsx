import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import MyRequests from "./pages/MyRequests";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRequests from "./pages/admin/Requests";
import AdminInventory from "./pages/admin/Inventory";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminNewItemRequests from "./pages/admin/NewItemRequests";
import InitializeDB from "./pages/admin/InitializeDB";
import NotFound from "./pages/NotFound";
import { CartProvider } from "@/context/CartContext";

const queryClient = new QueryClient();

// Create a language wrapper component
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  
  // Ensure lang attribute is set on language change
  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);
  
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageWrapper>
          <Toaster />
          <Sonner />
          <CartProvider>
            <BrowserRouter basename="/osr-msigsx">
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes for general users */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                
                {/* Protected routes for admin users */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRequests /></ProtectedRoute>} />
                <Route path="/admin/new-item-requests" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNewItemRequests /></ProtectedRoute>} />
                <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={["admin"]}><AdminInventory /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/initialize-db" element={<ProtectedRoute allowedRoles={["admin"]}><InitializeDB /></ProtectedRoute>} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </LanguageWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

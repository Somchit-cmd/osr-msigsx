import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, User, LogOut, Package, ClipboardList, LayoutDashboard, Inbox, Boxes, BarChart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo-small.webp";
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";
import { useState } from "react";

interface HeaderProps {
  userRole?: string;
}

export default function Header({ userRole = "employee" }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = userRole === "admin" || userRole === "supervisor";
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="bg-brand-blue text-white py-3 px-4 md:px-8 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-semibold">
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-28 mr-4 object-contain" 
              />
              
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isAdmin ? (
            <>
              <Link 
                to="/" 
                className={`text-white hover:text-opacity-80 px-3 py-1 rounded flex items-center ${location.pathname === '/' ? 'font-medium bg-brand-blue/80' : ''}`}
              >
                <Package className="w-4 h-4 mr-1" />
                Equipment
              </Link>
              <Link 
                to="/my-requests" 
                className={`text-white hover:text-opacity-80 px-3 py-1 rounded flex items-center ${location.pathname === '/my-requests' ? 'font-medium bg-brand-blue/80' : ''}`}
              >
                <ClipboardList className="w-4 h-4 mr-1" />
                My Requests
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-brand-blue hover:bg-gray-100"
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`text-white hover:text-opacity-80 px-3 py-1 rounded flex items-center ${location.pathname === '/admin/dashboard' ? 'font-medium bg-brand-blue/80' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <Link 
                to="/admin/requests" 
                className={`text-white hover:text-opacity-80 px-3 py-1 rounded flex items-center ${location.pathname === '/admin/requests' ? 'font-medium bg-brand-blue/80' : ''}`}
              >
                <Inbox className="w-4 h-4 mr-1" />
                Requests
              </Link>
              <Link 
                to="/admin/inventory" 
                className={`text-white hover:text-opacity-80 px-3 py-1 rounded flex items-center ${location.pathname === '/admin/inventory' ? 'font-medium bg-brand-blue/80' : ''}`}
              >
                <Boxes className="w-4 h-4 mr-1" />
                Inventory
              </Link>
              <Link 
                to="/admin/reports" 
                className={`text-white hover:text-opacity-80 px-3 py-1 rounded flex items-center ${location.pathname === '/admin/reports' ? 'font-medium bg-brand-blue/80' : ''}`}
              >
                <BarChart className="w-4 h-4 mr-1" />
                Reports
              </Link>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-white text-brand-blue hover:bg-gray-100"
              >
                <Link to="/admin/settings">
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="bg-white text-brand-blue hover:bg-gray-100" onClick={() => setIsLogoutDialogOpen(true)}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
      <LogoutConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </header>
  );
}

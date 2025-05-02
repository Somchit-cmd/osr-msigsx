
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  userRole?: string;
}

export default function Header({ userRole = "employee" }: HeaderProps) {
  const location = useLocation();
  const isAdmin = userRole === "admin" || userRole === "supervisor";

  return (
    <header className="bg-brand-blue text-white py-3 px-4 md:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-semibold">
            <Link to="/" className="flex items-center">
              <svg 
                viewBox="0 0 24 24" 
                className="w-7 h-7 mr-2" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Office Equipment Reservation
            </Link>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          {!isAdmin ? (
            <>
              <Link 
                to="/" 
                className={`text-white hover:text-opacity-80 ${location.pathname === '/' ? 'font-medium' : ''}`}
              >
                Equipment
              </Link>
              <Link 
                to="/my-requests" 
                className={`text-white hover:text-opacity-80 ${location.pathname === '/my-requests' ? 'font-medium' : ''}`}
              >
                My Reservations
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`text-white hover:text-opacity-80 ${location.pathname === '/admin/dashboard' ? 'font-medium' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/requests" 
                className={`text-white hover:text-opacity-80 ${location.pathname === '/admin/requests' ? 'font-medium' : ''}`}
              >
                Requests
              </Link>
              <Link 
                to="/admin/inventory" 
                className={`text-white hover:text-opacity-80 ${location.pathname === '/admin/inventory' ? 'font-medium' : ''}`}
              >
                Inventory
              </Link>
              <Link 
                to="/admin/reports" 
                className={`text-white hover:text-opacity-80 ${location.pathname === '/admin/reports' ? 'font-medium' : ''}`}
              >
                Reports
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center space-x-2">
          {!isAdmin ? (
            <Button variant="outline" size="sm" asChild className="bg-white text-brand-blue hover:bg-gray-100">
              <Link to="/login">
                <User className="w-4 h-4 mr-1" />
                Admin Login
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="bg-white text-brand-blue hover:bg-gray-100">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

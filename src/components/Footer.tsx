
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white py-6 mt-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-text-muted text-sm">
              © {new Date().getFullYear()} Office Supplies Request System. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4 text-sm">
            <Link to="/help" className="text-text-muted hover:text-brand-blue">Help</Link>
            <Link to="/support" className="text-text-muted hover:text-brand-blue">Support</Link>
            <Link to="/policy" className="text-text-muted hover:text-brand-blue">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

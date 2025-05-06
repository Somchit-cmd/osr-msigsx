import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white py-6 mt-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <p className="text-text-muted text-sm text-center">
            © {new Date().getFullYear()} Office Supplies Request System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

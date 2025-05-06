import { useState, useEffect } from "react";
import { InventoryItem } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import CategoryFilter from "@/components/CategoryFilter";
import RequestForm from "@/components/RequestForm";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import categoriesData from "@/data/categories.json";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [selectedEquipment, setSelectedEquipment] = useState<InventoryItem | null>(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [categories, setCategories] = useState(categoriesData);
  const [equipments, setEquipments] = useState<InventoryItem[]>([]);
  const navigate = useNavigate();
  const user =
    JSON.parse(sessionStorage.getItem("user") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Fetch equipment from Firebase
  useEffect(() => {
    const fetchEquipments = async () => {
      const snap = await getDocs(collection(db, "inventory"));
      setEquipments(
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))
      );
    };
    fetchEquipments();
  }, []);

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(doc => doc.data().name)); // Adjust as needed
    };
    fetchCategories();
  }, []);

  // Filter equipment by category and search query
  const filteredEquipment = equipments.filter(item => {
    const matchesCategory = activeCategory === "All Items" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const handleReserve = (equipmentId: string) => {
    const equipment = equipments.find(item => item.id === equipmentId);
    if (equipment) {
      setSelectedEquipment(equipment);
      setIsRequestFormOpen(true);
    }
  };
  
  const handleRequestSubmit = (formData: any) => {
    console.log("Request submitted:", formData);
    // In a real app, we would send this to an API
    // For now, just show a success message
    toast({
      title: "Request submitted successfully",
      description: `Your request for ${formData.quantity} ${formData.equipmentName}(s) is being processed.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Available Office Supplies</h1>
          <p className="text-text-muted">Browse and request supplies for your needs</p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          
          <div className="relative w-full max-w-xs md:w-64 self-start">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search supplies..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-text-muted">No supplies found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard 
                key={item.id} 
                equipment={item} 
                onReserve={handleReserve} 
              />
            ))}
          </div>
        )}
      </main>
      
      <RequestForm 
        isOpen={isRequestFormOpen}
        onClose={() => setIsRequestFormOpen(false)}
        equipment={selectedEquipment}
        onSubmit={handleRequestSubmit}
      />
      
      <Footer />
    </div>
  );
};

export default Index;

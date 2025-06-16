import { useState, useEffect } from "react";
import { InventoryItem } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import CategoryFilter from "@/components/CategoryFilter";
import ItemDetailDialog from "@/components/ItemDetailDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import RequestNewItemDialog from "@/components/RequestNewItemDialog";
import RequestForm from "@/components/RequestForm";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isItemDetailOpen, setIsItemDetailOpen] = useState(false);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [equipments, setEquipments] = useState<InventoryItem[]>([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("user") || "null")
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleStorage = () => {
      setUser(
        JSON.parse(sessionStorage.getItem("user") || "null") ||
          JSON.parse(localStorage.getItem("user") || "null")
      );
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Fetch equipment from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory"), (snap) => {
      setEquipments(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as InventoryItem))
      );
    });
    return () => unsubscribe();
  }, []);

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((doc) => doc.data().name)); // Adjust as needed
    };
    fetchCategories();
  }, []);

  // Filter equipment by category and search query
  const filteredEquipment = equipments.filter((item) => {
    const matchesCategory =
      activeCategory === "All Items" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleViewItem = (equipmentId: string) => {
    const equipment = equipments.find((item) => item.id === equipmentId);
    if (equipment) {
      setSelectedItem(equipment);
      setIsItemDetailOpen(true);
    }
  };

  const handleRequestNow = (equipmentId: string) => {
    const equipment = equipments.find((item) => item.id === equipmentId);
    if (equipment) {
      setSelectedItem(equipment);
      setIsRequestFormOpen(true);
    }
  };

  const handleRequestSubmit = (formData: any) => {
    toast({
      title: t("requestForm.successTitle"),
      description: t("requestForm.successDescription", { 
        quantity: formData.quantity, 
        name: formData.equipmentName 
      }),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("homepage.title")}</h1>
          <p className="text-text-muted">{t("homepage.subtitle")}</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsNewItemDialogOpen(true)}>
              {t("homepage.requestNewItem")}
            </Button>
            <div className="relative w-full max-w-xs md:w-64 self-start">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("homepage.searchPlaceholder")}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-text-muted">{t("homepage.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onView={handleViewItem}
                onRequestNow={handleRequestNow}
              />
            ))}
          </div>
        )}
      </main>

      <ItemDetailDialog
        isOpen={isItemDetailOpen}
        onClose={() => setIsItemDetailOpen(false)}
        item={selectedItem}
      />

      <RequestForm
        isOpen={isRequestFormOpen}
        onClose={() => setIsRequestFormOpen(false)}
        equipment={selectedItem}
        onSubmit={handleRequestSubmit}
      />

      <RequestNewItemDialog
        isOpen={isNewItemDialogOpen}
        onClose={() => setIsNewItemDialogOpen(false)}
        user={user}
      />

      <Footer />
    </div>
  );
};

export default Index;

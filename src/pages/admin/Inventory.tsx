import { useState, useEffect } from "react";
import { subscribeToInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/inventoryService";
import { subscribeToCategories } from "@/lib/categoryService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/types";
import placeholderImg from "/placeholder.svg";

const AdminInventory = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: "increase",
    quantity: 1,
    notes: "",
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    category: "",
    available: 1,
    totalStock: 1,
    minQuantity: 1,
    image: "",
  });
  const [editItem, setEditItem] = useState({
    name: "",
    description: "",
    category: "",
    available: 1,
    totalStock: 1,
    minQuantity: 1,
    image: "",
  });
  
  // Get unique categories
  const uniqueCategories = ["all", ...new Set(inventoryItems.map(item => item.category))];
  
  // Filter inventory by category and search query
  const filteredInventory = inventoryItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  useEffect(() => {
    const unsubscribe = subscribeToInventory(setInventoryItems);
    const unsubscribeCategories = subscribeToCategories(setCategories);
    return () => {
      unsubscribe();
      unsubscribeCategories();
    };
  }, []);
  
  useEffect(() => {
    if (selectedItem) {
      setEditItem({
        name: selectedItem.name,
        description: selectedItem.description,
        category: selectedItem.category,
        available: selectedItem.available,
        totalStock: selectedItem.totalStock,
        minQuantity: selectedItem.minQuantity,
        image: selectedItem.image || "",
      });
    }
  }, [selectedItem]);
  
  const handleAddItem = async (item) => {
    await addInventoryItem(item);
    toast({
      title: "Item added",
      description: `${item.name} has been added to inventory.`,
    });
    setIsAddDialogOpen(false);
  };
  
  const handleEditItem = async (id, updatedFields) => {
    await updateInventoryItem(id, updatedFields);
    toast({
      title: "Item updated",
      description: `${updatedFields.name} has been updated.`,
    });
    setIsEditDialogOpen(false);
  };
  
  const handleStockAdjustment = async () => {
    if (!selectedItem) return;

    let newAvailable = selectedItem.available;
    if (stockAdjustment.type === "increase") {
      newAvailable += stockAdjustment.quantity;
    } else {
      newAvailable = Math.max(0, newAvailable - stockAdjustment.quantity);
    }

    await updateInventoryItem(selectedItem.id, { available: newAvailable });

    toast({
      title: "Stock updated",
      description: `${selectedItem.name} stock ${stockAdjustment.type === "increase" ? "increased" : "decreased"} by ${stockAdjustment.quantity}.`,
    });
    setIsStockDialogOpen(false);
  };
  
  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };
  
  const openStockDialog = (item: InventoryItem, type: "increase" | "decrease") => {
    setSelectedItem(item);
    setStockAdjustment({ type, quantity: 1, notes: "" });
    setIsStockDialogOpen(true);
  };

  const handleRemoveItem = async (id) => {
    await deleteInventoryItem(id);
    toast({
      title: "Item removed",
      description: `${selectedItem?.name} has been removed from inventory.`,
    });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Office Supplies</h1>
            <p className="text-text-muted">Manage supplies and stock levels</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0 bg-brand-blue hover:bg-brand-blue/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Item
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs 
                defaultValue="all" 
                value={activeCategory} 
                onValueChange={setActiveCategory}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-3 md:grid-cols-5 h-10">
                  {uniqueCategories.slice(0, 5).map((category) => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category === "all" ? "All Items" : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-100 font-bold">Item</TableHead>
                <TableHead className="bg-gray-100 font-bold">Category</TableHead>
                <TableHead className="text-center bg-gray-100 font-bold">Available</TableHead>
                <TableHead className="text-center bg-gray-100 font-bold">Max Stock</TableHead>
                <TableHead className="text-center bg-gray-100 font-bold">Status</TableHead>
                <TableHead className="text-right bg-gray-100 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No items found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          <img 
                            src={item.image || placeholderImg} 
                            alt={item.name} 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = placeholderImg;
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">{item.available}</TableCell>
                    <TableCell className="text-center">{item.totalStock}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.available === 0
                            ? "bg-gray-200 text-gray-700"
                            : item.available <= item.minQuantity
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {item.available === 0
                          ? "Out of Stock"
                          : item.available <= item.minQuantity
                            ? "Low Stock"
                            : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStockDialog(item, "increase")}
                          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStockDialog(item, "decrease")}
                          disabled={item.available <= 0}
                          className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      
      {/* Add New Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Add a new equipment item to the inventory.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 py-4" onSubmit={e => { e.preventDefault(); handleAddItem(newItem); }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  required
                  placeholder="Item name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  required
                  className="w-full border rounded px-2 py-2"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Brief description of the equipment..."
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available">Available</Label>
                <Input
                  id="available"
                  type="number"
                  min={0}
                  value={newItem.available}
                  onChange={e => setNewItem({ ...newItem, available: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalStock">Total Stock</Label>
                <Input
                  id="totalStock"
                  type="number"
                  min={0}
                  value={newItem.totalStock}
                  onChange={e => setNewItem({ ...newItem, totalStock: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Min Quantity</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  min={1}
                  value={newItem.minQuantity}
                  onChange={e => setNewItem({ ...newItem, minQuantity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image (optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setNewItem(prev => ({ ...prev, image: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {newItem.image && (
                <img src={newItem.image} alt="Preview" className="w-16 h-16 object-contain mt-2" />
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!newItem.name || !newItem.category || !newItem.description}
              >
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Update equipment details and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <form
              className="space-y-4 py-4"
              onSubmit={e => {
                e.preventDefault();
                handleEditItem(selectedItem.id, editItem);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Equipment Name</Label>
                  <Input
                    id="edit-name"
                    value={editItem.name}
                    onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <select
                    id="edit-category"
                    value={editItem.category}
                    onChange={e => setEditItem({ ...editItem, category: e.target.value })}
                    required
                    className="w-full border rounded px-2 py-2"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editItem.description}
                  onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-available">Available</Label>
                  <Input
                    id="edit-available"
                    type="number"
                    min={0}
                    value={editItem.available}
                    onChange={e => setEditItem({ ...editItem, available: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-totalStock">Total Stock</Label>
                  <Input
                    id="edit-totalStock"
                    type="number"
                    min={0}
                    value={editItem.totalStock}
                    onChange={e => setEditItem({ ...editItem, totalStock: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minQuantity">Min Quantity</Label>
                  <Input
                    id="edit-minQuantity"
                    type="number"
                    min={1}
                    value={editItem.minQuantity}
                    onChange={e => setEditItem({ ...editItem, minQuantity: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Image (optional)</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditItem(prev => ({ ...prev, image: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {editItem.image && (
                  <img src={editItem.image} alt="Preview" className="w-16 h-16 object-contain mt-2" />
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !editItem.name ||
                    !editItem.category ||
                    !editItem.description
                  }
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Stock Adjustment Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {stockAdjustment.type === "increase" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
            <DialogDescription>
              {stockAdjustment.type === "increase"
                ? `Add more units to ${selectedItem?.name} inventory.`
                : `Remove units from ${selectedItem?.name} inventory.`}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Quantity</Label>
              <Input 
                id="stock-quantity" 
                type="number" 
                min={1}
                max={stockAdjustment.type === "decrease" ? selectedItem?.available : 999}
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment({
                  ...stockAdjustment,
                  quantity: parseInt(e.target.value) || 1,
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock-notes">Notes (Optional)</Label>
              <Textarea
                id="stock-notes"
                placeholder="Reason for this adjustment..."
                value={stockAdjustment.notes}
                onChange={(e) => setStockAdjustment({
                  ...stockAdjustment,
                  notes: e.target.value,
                })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsStockDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleStockAdjustment}
                className={stockAdjustment.type === "increase" 
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                }
              >
                {stockAdjustment.type === "increase" ? "Add Stock" : "Remove Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminInventory;

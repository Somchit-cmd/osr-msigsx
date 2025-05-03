import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import usersData from "@/data/users.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import categoriesData from "@/data/categories.json";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddUserDialog from "@/components/AddUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import RemoveUserDialog from "@/components/RemoveUserDialog";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import SetRoleDialog from "@/components/SetRoleDialog";
import AddCategoryDialog from "@/components/AddCategoryDialog";
import EditCategoryDialog from "@/components/EditCategoryDialog";
import RemoveCategoryDialog from "@/components/RemoveCategoryDialog";

export default function AdminSettings() {
  // For demo, use local state. In a real app, use context or API.
  const [users, setUsers] = useState(
    usersData.map((user, idx) => ({
      ...user,
      id: (user as any).id || user.username || String(idx),
    }))
  );
  const [categories, setCategories] = useState(categoriesData);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isRemoveUserDialogOpen, setIsRemoveUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isSetRoleDialogOpen, setIsSetRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    surname: "",
    role: "employee",
    email: "",
    phone: "",
  });
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isRemoveCategoryDialogOpen, setIsRemoveCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isFormValid =
    newUser.username.trim() &&
    newUser.name.trim() &&
    newUser.surname.trim() &&
    newUser.email.trim() &&
    newUser.phone.trim();

  // Read categories from localStorage on mount
  useEffect(() => {
    const localCategories = localStorage.getItem("categories");
    if (localCategories) {
      setCategories(JSON.parse(localCategories));
    }
  }, []);

  // Update localStorage when categories change
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const handleAddUser = (user) => {
    setUsers([
      ...users,
      {
        ...user,
        id: Date.now().toString(),
        password: "password",
        department: "HR",
        title: "Employee",
      },
    ]);
  };

  const handleEditUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleRemoveUser = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
  };

  const handleResetPassword = (newPassword) => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, password: newPassword } : u));
  };

  const handleSetRole = (role) => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role } : u));
  };

  const handleAddCategory = (category: string) => {
    setCategories([...categories, category]);
  };

  const handleEditCategory = (newCategory: string) => {
    setCategories(categories.map(cat => cat === selectedCategory ? newCategory : cat));
  };

  const handleRemoveCategory = () => {
    setCategories(categories.filter(cat => cat !== selectedCategory));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* User Management */}
        <Card className="shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50 rounded-t-xl px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <CardTitle className="text-lg font-semibold">User Management</CardTitle>
            </div>
            <Button
              className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-md px-4 py-2"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              + Add User
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-medium rounded-tl-xl">Username</th>
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Role</th>
                  <th className="p-3 text-left font-medium rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{user.username}</td>
                    <td className="p-3 border-b">{user.name} {user.surname}</td>
                    <td className="p-3 border-b">{user.role}</td>
                    <td className="p-3 border-b">
                      <Button
                        size="sm"
                        className="mr-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        onClick={() => { setSelectedUser(user); setIsEditUserDialogOpen(true); }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="mr-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        onClick={() => { setSelectedUser(user); setIsRemoveUserDialogOpen(true); }}
                      >
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        className="mr-2 bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                        onClick={() => { setSelectedUser(user); setIsResetPasswordDialogOpen(true); }}
                      >
                        Reset Password
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                        onClick={() => { setSelectedUser(user); setIsSetRoleDialogOpen(true); }}
                      >
                        Set Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Inventory Management */}
        <Card className="shadow-lg rounded-xl border border-gray-200 mt-8">
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50 rounded-t-xl px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <CardTitle className="text-lg font-semibold">Inventory Management</CardTitle>
            </div>
            <Button
              className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-md px-4 py-2"
              onClick={() => setIsAddCategoryDialogOpen(true)}
            >
              + Add Category
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-medium rounded-tl-xl">Category Name</th>
                  <th className="p-3 text-left font-medium rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{cat}</td>
                    <td className="p-3 border-b">
                      <Button
                        size="sm"
                        className="mr-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        onClick={() => { setSelectedCategory(cat); setIsEditCategoryDialogOpen(true); }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        onClick={() => { setSelectedCategory(cat); setIsRemoveCategoryDialogOpen(true); }}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onAddUser={handleAddUser}
      />
      <EditUserDialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        user={selectedUser}
        onEditUser={handleEditUser}
      />
      <RemoveUserDialog
        open={isRemoveUserDialogOpen}
        onOpenChange={setIsRemoveUserDialogOpen}
        user={selectedUser}
        onRemoveUser={handleRemoveUser}
      />
      <ResetPasswordDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        user={selectedUser}
        onResetPassword={handleResetPassword}
      />
      <SetRoleDialog
        open={isSetRoleDialogOpen}
        onOpenChange={setIsSetRoleDialogOpen}
        user={selectedUser}
        onSetRole={handleSetRole}
      />
      <AddCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        onAddCategory={handleAddCategory}
      />
      <EditCategoryDialog
        open={isEditCategoryDialogOpen}
        onOpenChange={setIsEditCategoryDialogOpen}
        category={selectedCategory || ""}
        onEditCategory={handleEditCategory}
      />
      <RemoveCategoryDialog
        open={isRemoveCategoryDialogOpen}
        onOpenChange={setIsRemoveCategoryDialogOpen}
        category={selectedCategory || ""}
        onRemoveCategory={handleRemoveCategory}
      />
    </div>
  );
}

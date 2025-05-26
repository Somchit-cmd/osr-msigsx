import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddUserDialog from "@/components/AddUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import RemoveUserDialog from "@/components/RemoveUserDialog";
import AddCategoryDialog from "@/components/AddCategoryDialog";
import EditCategoryDialog from "@/components/EditCategoryDialog";
import RemoveCategoryDialog from "@/components/RemoveCategoryDialog";
import { subscribeToAllUsers, addUser, editUser, removeUser } from "@/lib/userService";
import { subscribeToCategories, addCategory, editCategory, removeCategory } from "@/lib/categoryService";
import { useTranslation } from 'react-i18next';

export default function AdminSettings() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isRemoveUserDialogOpen, setIsRemoveUserDialogOpen] = useState(false);
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
  const [selectedCategory, setSelectedCategory] = useState<{ id: string, name: string } | null>(null);

  const isFormValid =
    newUser.username.trim() &&
    newUser.name.trim() &&
    newUser.surname.trim() &&
    newUser.email.trim() &&
    newUser.phone.trim();

  // Subscribe to Firestore users collection
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers(setUsers);
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore categories
  useEffect(() => {
    const unsubscribe = subscribeToCategories(setCategories);
    return () => unsubscribe();
  }, []);

  const handleAddUser = async (user) => {
    await addUser(user);
  };

  const handleEditUser = async (user) => {
    await editUser(user);
  };

  const handleRemoveUser = async () => {
    if (selectedUser) {
      await removeUser(selectedUser.id);
    }
  };

  const handleAddCategory = async (categoryName: string) => {
    await addCategory(categoryName);
  };

  const handleEditCategory = async (id: string, newName: string) => {
    await editCategory(id, newName);
  };

  const handleRemoveCategory = async (id: string) => {
    await removeCategory(id);
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
              <CardTitle className="text-lg font-semibold">{t('settings.userManagement')}</CardTitle>
            </div>
            <Button
              className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-md px-4 py-2"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              + {t('settings.addUser')}
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-medium rounded-tl-xl">{t('settings.username')}</th>
                  <th className="p-3 text-left font-medium">{t('settings.name')}</th>
                  <th className="p-3 text-left font-medium">{t('settings.department')}</th>
                  <th className="p-3 text-left font-medium">{t('settings.role')}</th>
                  <th className="p-3 text-left font-medium rounded-tr-xl">{t('settings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{user.id}</td>
                    <td className="p-3 border-b">{user.name} {user.surname}</td>
                    <td className="p-3 border-b">{user.department}</td>
                    <td className="p-3 border-b">{user.role}</td>
                    <td className="p-3 border-b">
                      <Button
                        size="sm"
                        className="mr-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        onClick={() => { setSelectedUser(user); setIsEditUserDialogOpen(true); }}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        className="mr-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        onClick={() => { setSelectedUser(user); setIsRemoveUserDialogOpen(true); }}
                      >
                        {t('common.remove')}
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
              <CardTitle className="text-lg font-semibold">{t('settings.inventoryManagement')}</CardTitle>
            </div>
            <Button
              className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-md px-4 py-2"
              onClick={() => setIsAddCategoryDialogOpen(true)}
            >
              + {t('settings.addCategory')}
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-medium rounded-tl-xl">{t('settings.categoryName')}</th>
                  <th className="p-3 text-left font-medium rounded-tr-xl">{t('settings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{cat.name}</td>
                    <td className="p-3 border-b">
                      <Button
                        size="sm"
                        className="mr-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        onClick={() => { setSelectedCategory(cat); setIsEditCategoryDialogOpen(true); }}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        onClick={() => { setSelectedCategory(cat); setIsRemoveCategoryDialogOpen(true); }}
                      >
                        {t('common.remove')}
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
      <AddCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        onAddCategory={handleAddCategory}
      />
      <EditCategoryDialog
        open={isEditCategoryDialogOpen}
        onOpenChange={setIsEditCategoryDialogOpen}
        category={selectedCategory}
        onEditCategory={(newName) => {
          if (selectedCategory) handleEditCategory(selectedCategory.id, newName);
        }}
      />
      <RemoveCategoryDialog
        open={isRemoveCategoryDialogOpen}
        onOpenChange={setIsRemoveCategoryDialogOpen}
        category={selectedCategory ? selectedCategory.name : ""}
        onRemoveCategory={() => {
          if (selectedCategory) handleRemoveCategory(selectedCategory.id);
        }}
      />
    </div>
  );
}

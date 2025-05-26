import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { subscribeToDepartments } from "@/lib/departmentService";
import { useTranslation } from "react-i18next";

type AddUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: {
    id: string;
    name: string;
    surname: string;
    department: string;
    email: string;
    password: string;
    role: string;
  }) => void;
};

export default function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
  const { t } = useTranslation();
  const [newUser, setNewUser] = useState({
    id: "",
    name: "",
    surname: "",
    department: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (!open) {
      setNewUser({
        id: "",
        name: "",
        surname: "",
        department: "",
        email: "",
        password: "",
        role: "employee",
      });
    }
  }, [open]);

  // Auto-generate email when name or surname changes
  useEffect(() => {
    if (newUser.name && newUser.surname) {
      const email = `${newUser.name.trim().toLowerCase()}.${newUser.surname.trim().toLowerCase()}@msig-sokxay.com`;
      setNewUser(prev => ({ ...prev, email }));
    } else {
      setNewUser(prev => ({ ...prev, email: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUser.name, newUser.surname]);

  useEffect(() => {
    const unsubscribe = subscribeToDepartments(setDepartments);
    return () => unsubscribe();
  }, []);

  const isFormValid =
    newUser.id.trim() &&
    newUser.name.trim() &&
    newUser.surname.trim() &&
    newUser.department.trim() &&
    newUser.email.trim() &&
    newUser.password.trim() &&
    newUser.role.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onAddUser(newUser);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('addUser.title')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold mb-2">{t('addUser.personalInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('addUser.firstName')}</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">{t('addUser.lastName')}</Label>
                <Input
                  id="surname"
                  value={newUser.surname}
                  onChange={e => setNewUser({ ...newUser, surname: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{t('addUser.department')}</Label>
                <select
                  id="department"
                  className="w-full border rounded px-2 py-2"
                  value={newUser.department}
                  onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                  required
                >
                  <option value="">{t('addUser.selectDepartment')}</option>
                  {departments.map(dep => (
                    <option key={dep.id} value={dep.name}>{dep.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Account Information */}
          <div>
            <h3 className="font-semibold mb-2">{t('addUser.accountInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">{t('addUser.userId')}</Label>
                <Input
                  id="id"
                  value={newUser.id}
                  onChange={e => setNewUser({ ...newUser, id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('addUser.email')}</Label>
                <Input
                  id="email"
                  value={newUser.email}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
                
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('addUser.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t('addUser.role')}</Label>
                <select
                  id="role"
                  className="w-full border rounded px-2 py-2"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  required
                >
                  <option value="employee">{t('addUser.employee')}</option>
                  <option value="admin">{t('addUser.admin')}</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              {t('addUser.addUser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

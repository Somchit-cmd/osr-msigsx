import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NewItemRequest } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getStatusBadgeClass } from '@/utils/helpers';

const AdminNewItemRequests = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [requests, setRequests] = useState<NewItemRequest[]>([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'newItemRequests'), (snapshot) => {
      const newRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as NewItemRequest));
      setRequests(newRequests);
    });
    return () => unsubscribe();
  }, []);

  const createNotificationForUser = async (userId: string, itemName: string, status: string) => {
    if (!userId) return;
    
    try {
      await addDoc(collection(db, "notifications"), {
        userId: userId,
        type: status === 'approved' ? 'request_approved' : 'request_rejected',
        read: false,
        createdAt: serverTimestamp(),
        message: status === 'approved' 
          ? 'notificationMessages.itemRequestApproved'
          : 'notificationMessages.itemRequestRejected',
        messageParams: {
          itemName: itemName
        }
      });
    } catch (error) {
      console.error("Error creating user notification:", error);
    }
  };

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const request = requests.find(req => req.id === id);
      if (!request) {
        throw new Error("Request not found");
      }
      
      const requestRef = doc(db, 'newItemRequests', id);
      await updateDoc(requestRef, {
        status: newStatus,
        processedAt: serverTimestamp(),
      });
      
      // Create notification for the user
      await createNotificationForUser(request.userId, request.itemName, newStatus);
      
      toast({
        title: `Request ${newStatus}`,
        description: `The new item request has been ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Error updating request status:`, error);
      toast({
        title: 'Error',
        description: 'Failed to update the request status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const requestRef = doc(db, 'newItemRequests', id);
      await deleteDoc(requestRef);
      
      toast({
        title: t('newItemRequests.toast.deleted.title'),
        description: t('newItemRequests.toast.deleted.description'),
      });
    } catch (error) {
      console.error(t('newItemRequests.errors.deleteRequest'), error);
      toast({
        title: t('newItemRequests.toast.error.title'),
        description: t('newItemRequests.toast.deleteError.description'),
        variant: 'destructive',
      });
    }
  };

  const filteredRequests = requests.filter((req) => req.status === activeTab);

  const renderTable = (data: NewItemRequest[]) => (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('newItemRequests.table.itemName')}</TableHead>
            <TableHead>{t('newItemRequests.table.employee')}</TableHead>
            <TableHead>{t('newItemRequests.table.requestDate')}</TableHead>
            <TableHead>{t('newItemRequests.table.reason')}</TableHead>
            <TableHead className="text-right">{t('newItemRequests.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                {t('newItemRequests.table.noRequests')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.itemName}</TableCell>
                <TableCell>{req.employeeName}</TableCell>
                <TableCell>{formatDate(req.createdAt)}</TableCell>
                <TableCell>{req.reason}</TableCell>
                <TableCell className="text-right">
                  {req.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'approved')}>
                        {t('newItemRequests.actions.approve')}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleAction(req.id, 'rejected')}>
                        {t('newItemRequests.actions.reject')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(req.id)}>
                        {t('newItemRequests.actions.delete')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(req.id)}>
                        {t('newItemRequests.actions.delete')}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{t('newItemRequests.title')}</h1>
        <p className="text-text-muted mb-8">{t('newItemRequests.description')}</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="pending">{t('newItemRequests.tabs.pending')}</TabsTrigger>
            <TabsTrigger value="approved">{t('newItemRequests.tabs.approved')}</TabsTrigger>
            <TabsTrigger value="rejected">{t('newItemRequests.tabs.rejected')}</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{renderTable(filteredRequests)}</TabsContent>
          <TabsContent value="approved">{renderTable(filteredRequests)}</TabsContent>
          <TabsContent value="rejected">{renderTable(filteredRequests)}</TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNewItemRequests; 
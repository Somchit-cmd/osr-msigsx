import { useState } from "react";
import { initializeFirestore } from "@/lib/initializeFirestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const InitializeDB = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const success = await initializeFirestore();
      if (success) {
        toast({
          title: "Success",
          description: "Database collections initialized successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize database collections.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while initializing the database.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRole="admin" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Initialize Database</h1>
          <p className="text-gray-600 mb-6">
            This will create the necessary collections and add sample data to your Firestore database.
            Only run this once when setting up the application for the first time.
          </p>
          
          <Button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full"
          >
            {isInitializing ? "Initializing..." : "Initialize Database"}
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InitializeDB; 
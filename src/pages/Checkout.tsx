import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createBulkRequest } from "@/lib/requestService";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Checkout = () => {
  const { t } = useTranslation();
  const { cartItems, clearCart, totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(sessionStorage.getItem("user") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      // Prepare cart items for submission
      const items = cartItems.map((item) => ({
        equipmentId: item.item.id,
        equipmentName: item.item.name,
        quantity: item.quantity,
      }));

      await createBulkRequest({
        items,
        employeeId: user.id,
        employeeName: `${user.name} ${user.surname || ""}`,
        department: user.department || "",
        notes,
      });

      toast({
        title: t("checkout.successTitle"),
        description: t("checkout.successMessage"),
      });

      clearCart();
      navigate("/my-requests");
    } catch (err) {
      console.error("Error submitting request:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit request"
      );
      toast({
        title: t("checkout.errorTitle"),
        description: t("checkout.errorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{t("checkout.title")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("checkout.description")}
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("checkout.errorTitle")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                {t("checkout.itemsReview")}
              </h2>

              <div className="rounded-lg border bg-card">
                <div className="p-4">
                  <ul className="divide-y">
                    {cartItems.map((item) => (
                      <li
                        key={item.item.id}
                        className="py-4 flex justify-between"
                      >
                        <div>
                          <h3 className="font-medium">{item.item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {item.quantity} {item.quantity === 1 ? "unit" : "units"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="notes">{t("checkout.notesLabel")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("checkout.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <div className="rounded-lg border bg-card p-4 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">
                  {t("checkout.summary")}
                </h2>

                <dl className="divide-y">
                  <div className="py-2 flex justify-between">
                    <dt>{t("checkout.totalItems")}</dt>
                    <dd className="font-medium">{totalItems}</dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt>{t("checkout.differentItems")}</dt>
                    <dd className="font-medium">{cartItems.length}</dd>
                  </div>
                </dl>

                <Separator className="my-4" />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("checkout.processing")}
                    </>
                  ) : (
                    t("checkout.submitRequest")
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate("/")}
                >
                  {t("checkout.continueShopping")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout; 
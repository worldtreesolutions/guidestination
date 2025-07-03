import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckoutSessionData } from "@/types/stripe";

interface CheckoutButtonProps {
  activityId: number;
  providerId: string;
  amount: number;
  participants: number;
  establishmentId?: string;
  customerId?: string;
  commissionPercent?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function CheckoutButton({
  activityId,
  providerId,
  amount,
  participants,
  establishmentId,
  customerId,
  commissionPercent = 20,
  children = "Book Now",
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const checkoutData: CheckoutSessionData = {
        activityId,
        providerId,
        establishmentId,
        customerId,
        amount,
        participants,
        commissionPercent,
        successUrl: `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/booking/cancelled`,
      };

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? "Processing..." : children}
    </Button>
  );
}
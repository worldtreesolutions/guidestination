
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutSessionData } from "@/types/stripe";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutButtonProps {
  checkoutData: CheckoutSessionData;
  disabled?: boolean;
}

export function CheckoutButton({ checkoutData, disabled = false }: CheckoutButtonProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/booking/${checkoutData.activityId}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(session.error || "Failed to create checkout session.");
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js has not loaded yet.");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (error) {
        console.error("Stripe redirect error:", error);
        setError(error.message || "An unexpected error occurred.");
      }
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={loading || disabled}
        className="w-full"
      >
        {loading ? t("checkout.processing") : t("checkout.bookNow")}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

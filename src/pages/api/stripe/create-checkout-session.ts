import { NextApiRequest, NextApiResponse } from "next";
import stripeService from "@/services/stripeService";
import { referralService } from "@/services/referralService";

interface CheckoutSessionData {
  activityId?: number;
  providerId?: string;
  establishmentId?: string;
  customerId?: string;
  amount: number;
  participants?: number;
  commissionPercent?: number;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  referralData?: {
    establishmentId: string;
    establishmentName: string;
    visitTimestamp: string;
  };
  // Cart checkout specific fields
  isCartCheckout?: boolean;
  items?: Array<{
    activityId: number;
    scheduleId: number;
    quantity: number;
    providerId: string;
    title: string;
    price: number;
    currency: string;
  }>;
  totalAmount?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    console.log("[Stripe Checkout] Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[Stripe Checkout] STRIPE_SECRET_KEY not set in environment.");
      return res.status(500).json({ 
        error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." 
      });
    }

    console.log("[Stripe Checkout] Incoming request body:", JSON.stringify(req.body, null, 2));

    const {
      activityId,
      providerId,
      establishmentId,
      customerId,
      amount,
      participants,
      commissionPercent = 20,
      successUrl,
      cancelUrl,
      currency = "thb", // Default to THB if not specified
      customerInfo,
      referralData,
      isCartCheckout = false,
      items,
      totalAmount,
    } = req.body;

    // Check for active establishment link (QR scan linking)
    let activeEstablishmentLink = null;
    let sessionId = null;
    let userId = null;
    
    try {
      // Try to get session ID from custom header or generate one
      sessionId = req.headers['x-session-id'] as string || req.headers['session-id'] as string;
      userId = customerId;
      
      activeEstablishmentLink = await referralService.getActiveEstablishmentLink(userId, sessionId);
      
      if (activeEstablishmentLink) {
        console.log(`[Stripe Checkout] Active establishment link found for ${activeEstablishmentLink.establishment_id}`);
      } else {
        console.log("[Stripe Checkout] No active establishment link found");
      }
    } catch (error) {
      console.warn("[Stripe Checkout] Error checking establishment link:", error);
    }

    // Validate required fields for single activity checkout
    if (!isCartCheckout && (!activityId || !providerId || !amount || !participants || !successUrl || !cancelUrl)) {
      console.warn("[Stripe Checkout] Missing required fields for single activity", { activityId, providerId, amount, participants, successUrl, cancelUrl });
      return res.status(400).json({ 
        error: "Missing required fields for single activity: activityId, providerId, amount, participants, successUrl, cancelUrl" 
      });
    }

    // Validate required fields for cart checkout
    if (isCartCheckout && (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !successUrl || !cancelUrl)) {
      console.warn("[Stripe Checkout] Missing required fields for cart checkout", { items, totalAmount, successUrl, cancelUrl });
      return res.status(400).json({ 
        error: "Missing required fields for cart checkout: items, totalAmount, successUrl, cancelUrl" 
      });
    }

    // Import Stripe dynamically to avoid issues
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Handle currency-specific processing
    let finalAmount: number;
    let stripeCurrency: string;
    
    const checkoutAmount = isCartCheckout ? totalAmount! : amount;
    
    if (currency.toLowerCase() === "thb") {
      // For THB, use the amount as-is (Stripe expects THB amounts in satang, but we'll use the actual THB amount)
      finalAmount = Math.round(checkoutAmount * 100); // Convert THB to satang (THB's smallest unit)
      stripeCurrency = "thb";
    } else {
      // For USD and other currencies, calculate with processing fees
      const stripeFeePercent = 0.029; // 2.9%
      const stripeFeeFixed = 0.30; // $0.30
      const stripeFee = (checkoutAmount * stripeFeePercent) + stripeFeeFixed;
      const totalAmountWithFees = checkoutAmount + stripeFee;
      finalAmount = Math.round(totalAmountWithFees * 100); // Convert to cents
      stripeCurrency = "usd";
    }

    // Create metadata object with proper typing
    const metadata: Record<string, string> = {
      commissionPercent: commissionPercent.toString(),
      baseAmount: checkoutAmount.toString(),
      currency: currency.toString(),
      isCartCheckout: isCartCheckout.toString(),
    };

    if (isCartCheckout && items) {
      // For cart checkout, store cart items info
      metadata.itemCount = items.length.toString();
      metadata.items = JSON.stringify(items); // Store full items for the webhook
      metadata.cartItems = JSON.stringify(items.map(item => ({
        activityId: item.activityId,
        scheduleId: item.scheduleId,
        quantity: item.quantity,
        providerId: item.providerId,
        title: item.title,
        price: item.price,
        currency: item.currency
      })));
    } else {
      // For single activity checkout
      metadata.activityId = activityId!.toString();
      metadata.providerId = providerId!;
      metadata.participants = participants!.toString();
    }

    if (establishmentId) {
      metadata.establishmentId = establishmentId;
    }

    if (customerId) {
      metadata.customerId = customerId;
    }

    if (customerInfo) {
      metadata.customerName = `${customerInfo.firstName} ${customerInfo.lastName}`;
      metadata.customerEmail = customerInfo.email;
      if (customerInfo.phone) {
        metadata.customerPhone = customerInfo.phone;
      }
    }

    if (referralData) {
      metadata.referralData = JSON.stringify(referralData);
    }

    // Add active establishment link to metadata for commission calculation
    if (activeEstablishmentLink) {
      metadata.establishmentLinkId = activeEstablishmentLink.id;
      metadata.linkedEstablishmentId = activeEstablishmentLink.establishment_id;
      metadata.hasActiveEstablishmentLink = 'true';
      console.log(`[Stripe Checkout] Adding establishment link to session metadata: ${activeEstablishmentLink.establishment_id}`);
    }

    // Add session and user info for commission lookup fallback
    if (sessionId) {
      metadata.sessionId = sessionId;
    }
    if (userId) {
      metadata.userId = userId;
    }

    // Create checkout session
    let lineItems;
    
    if (isCartCheckout && items) {
      // For cart checkout, create line items for each activity
      lineItems = items.map(item => ({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: item.title,
            description: `Activity booking for ${item.quantity} participant${item.quantity > 1 ? 's' : ''}`,
          },
          unit_amount: Math.round(item.price * 100), // Convert to smallest currency unit
        },
        quantity: item.quantity,
      }));
    } else {
      // For single activity checkout
      lineItems = [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: `Activity Booking - ${participants} participant(s)`,
              description: `Activity booking for ${participants} participant${participants! > 1 ? 's' : ''}`,
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ];
    }

    console.log("[Stripe Checkout] Creating Stripe session with line items:", JSON.stringify(lineItems, null, 2));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      customer_email: customerInfo?.email,
    });

    console.log(`[Stripe Checkout] Session created: ${session.id}, URL: ${session.url}`);

    res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error("[Stripe Checkout] Error creating checkout session:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to create checkout session" 
    });
  }
}

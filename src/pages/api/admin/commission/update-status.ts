import { NextApiRequest, NextApiResponse } from "next";
import { commissionService } from "@/services/commissionService";

// API endpoint to update commission invoice status from external admin portal
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Basic API key authentication
    const apiKey = req.headers["x-api-key"] as string;
    const expectedApiKey = process.env.ADMIN_API_KEY;

    if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({ error: "Unauthorized - Invalid API key" });
    }

    const { invoice_id, status, payment_data } = req.body;

    if (!invoice_id || !status) {
      return res.status(400).json({
        error: "Missing required fields: invoice_id and status"
      });
    }

    // Validate status
    const validStatuses = ["pending", "paid", "overdue", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    // Update invoice status
    const updatedInvoice = await commissionService.updateInvoiceStatus(
      invoice_id,
      status
    );

    // If marking as paid, create payment record
    if (status === "paid" && payment_data) {
      await commissionService.createCommissionPayment({
        invoiceId: invoice_id,
        paymentAmount: payment_data.amount || updatedInvoice.platform_commission_amount,
        paymentMethod: payment_data.method || "manual",
        paymentReference: payment_data.reference,
        stripePaymentIntentId: payment_data.stripe_payment_intent_id
      });
    }

    res.status(200).json({
      success: true,
      data: updatedInvoice
    });

  } catch (error) {
    console.error("Error updating commission invoice status:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

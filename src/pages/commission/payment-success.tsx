
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowLeft } from "lucide-react";
import commissionService, { CommissionInvoice } from "@/services/commissionService";

export default function CommissionPaymentSuccessPage() {
  const router = useRouter();
  const { invoice_id } = router.query;
  const [invoice, setInvoice] = useState<CommissionInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoice_id && typeof invoice_id === "string") {
      loadInvoice(invoice_id);
    }
  }, [invoice_id]);

  const loadInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      const invoiceData = await commissionService.getCommissionInvoice(invoiceId);
      setInvoice(invoiceData);
    } catch (error) {
      console.error("Failed to load invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Invoice not found</p>
            <Button 
              onClick={() => router.push("/")} 
              className="mt-4"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <p className="text-gray-600 mt-2">
              Your commission payment has been processed successfully.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-700">Invoice Number</label>
                  <p className="text-gray-900">{invoice.invoice_number}</p>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Payment Status</label>
                  <p className="text-green-600 font-medium">Paid</p>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Commission Amount</label>
                  <p className="text-gray-900 font-medium">
                    ${invoice.platform_commission_amount.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Payment Date</label>
                  <p className="text-gray-900">
                    {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <label className="font-medium text-gray-700">Booking Amount</label>
                  <p className="text-gray-900">${invoice.total_booking_amount.toFixed(2)}</p>
                </div>
                
                {invoice.is_qr_booking && (
                  <div className="col-span-2">
                    <label className="font-medium text-gray-700">Partner Commission</label>
                    <p className="text-gray-900">
                      ${invoice.partner_commission_amount.toFixed(2)} (50% of platform commission)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You will receive a payment confirmation email shortly</li>
                <li>• Your invoice status has been updated to "Paid"</li>
                <li>• This payment will be reflected in your next statement</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => router.push("/activity-owner/dashboard")}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <Button 
                onClick={() => window.print()}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

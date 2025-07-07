import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, CreditCard, CheckCircle } from "lucide-react";
import commissionService, { CommissionInvoice } from "@/services/commissionService";
import invoiceService from "@/services/invoiceService";

interface CommissionInvoiceListProps {
  status?: string;
}

export default function CommissionInvoiceList({ status }: CommissionInvoiceListProps) {
  const [invoices, setInvoices] = useState<CommissionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<CommissionInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(status || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      
      // Note: Server-side search would be more efficient for large datasets
      const { data, count } = await commissionService.getCommissionInvoices(filters);
      
      let filteredData = data;
      if (searchTerm) {
        filteredData = data.filter(invoice =>
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.provider_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setInvoices(filteredData);
      setTotalCount(count);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await commissionService.updateInvoiceStatus(invoiceId, "paid");
      loadInvoices();
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error);
    }
  };

  const handleCreatePaymentLink = async (invoice: CommissionInvoice) => {
    try {
      await invoiceService.createStripePaymentLink(invoice);
      loadInvoices();
    } catch (error) {
      console.error("Failed to create payment link:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      paid: "default",
      overdue: "destructive",
      cancelled: "secondary",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Commission Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by invoice number or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Booking Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>QR Booking</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.provider_id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        ${invoice.total_booking_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${invoice.platform_commission_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.invoice_status)}</TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {invoice.is_qr_booking ? (
                          <Badge variant="secondary">QR</Badge>
                        ) : (
                          <Badge variant="outline">Direct</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Invoice Details</DialogTitle>
                              </DialogHeader>
                              {selectedInvoice && (
                                <InvoiceDetails invoice={selectedInvoice} />
                              )}
                            </DialogContent>
                          </Dialog>

                          {invoice.invoice_status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreatePaymentLink(invoice)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsPaid(invoice.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} invoices
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * itemsPerPage >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceDetails({ invoice }: { invoice: CommissionInvoice }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Invoice Number</label>
          <p className="text-sm text-gray-600">{invoice.invoice_number}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-gray-600">{invoice.invoice_status}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Booking Amount</label>
          <p className="text-sm text-gray-600">${invoice.total_booking_amount.toFixed(2)}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Platform Commission</label>
          <p className="text-sm text-gray-600">
            ${invoice.platform_commission_amount.toFixed(2)} ({invoice.platform_commission_rate}%)
          </p>
        </div>
        {invoice.is_qr_booking && invoice.partner_commission_amount && (
          <div>
            <label className="text-sm font-medium">Partner Commission</label>
            <p className="text-sm text-gray-600">
              ${invoice.partner_commission_amount.toFixed(2)} ({invoice.partner_commission_rate}%)
            </p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Due Date</label>
          <p className="text-sm text-gray-600">
            {new Date(invoice.due_date).toLocaleDateString()}
          </p>
        </div>
        {invoice.paid_at && (
          <div>
            <label className="text-sm font-medium">Paid At</label>
            <p className="text-sm text-gray-600">
              {new Date(invoice.paid_at).toLocaleDateString()}
            </p>
          </div>
        )}
        {invoice.stripe_payment_link_url && (
          <div className="col-span-2">
            <label className="text-sm font-medium">Payment Link</label>
            <p className="text-sm text-blue-600 break-all">
              <a href={invoice.stripe_payment_link_url} target="_blank" rel="noopener noreferrer">
                {invoice.stripe_payment_link_url}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { CommissionInvoice } from "@/types/activity";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { commissionService } from "@/services/commissionService";
import { useLanguage } from "@/contexts/LanguageContext";

interface CommissionInvoiceListProps {
  providerId?: string;
  status?: "all" | "pending" | "overdue" | "paid";
}

export function CommissionInvoiceList({
  providerId,
  status = "all",
}: CommissionInvoiceListProps) {
  const [invoices, setInvoices] = useState<CommissionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useLanguage();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // This function needs to be created in commissionService
        const fetchedInvoices = await commissionService.getCommissionInvoices({
          providerId,
          status,
        });
        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [providerId, status]);

  if (loading) {
    return <p>Loading invoices...</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Provider ID</TableHead>
          <TableHead>Booking ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Commission</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.provider_id}</TableCell>
              <TableCell>{invoice.booking_id}</TableCell>
              <TableCell>
                {formatCurrency(invoice.total_booking_amount)}
              </TableCell>
              <TableCell>
                {formatCurrency(invoice.platform_commission_amount)}
              </TableCell>
              <TableCell>
                <Badge>{invoice.invoice_status}</Badge>
              </TableCell>
              <TableCell>{format(new Date(invoice.due_date), "PPP")}</TableCell>
              <TableCell>
                <Button size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              No invoices found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
  

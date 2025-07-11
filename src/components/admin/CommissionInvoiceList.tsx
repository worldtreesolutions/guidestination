import { useState, useEffect } from "react"
import { CommissionInvoice } from "@/types/activity"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface CommissionInvoiceListProps {
  providerId?: string
}

export function CommissionInvoiceList({
  providerId,
}: CommissionInvoiceListProps) {
  const [invoices, setInvoices] = useState<CommissionInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      try {
        // NOTE: The service function to fetch invoices is missing.
        // Using empty data to allow the component to render.
        setInvoices([]) 
      } catch (error) {
        console.error("Failed to fetch invoices:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [providerId])

  if (loading) {
    return <p>Loading invoices...</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.provider_name || "N/A"}</TableCell>
              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge>{invoice.status}</Badge>
              </TableCell>
              <TableCell>{format(new Date(invoice.due_date), "PPP")}</TableCell>
              <TableCell>
                <Button size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No invoices found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
  

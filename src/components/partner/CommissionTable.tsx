
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const data = [
  {
    category: "Adventure",
    bookings: 45,
    commission: 15420,
    growth: "+12%"
  },
  {
    category: "Culture",
    bookings: 38,
    commission: 12350,
    growth: "+8%"
  },
  {
    category: "Nature",
    bookings: 32,
    commission: 9800,
    growth: "+15%"
  },
  {
    category: "Food",
    bookings: 28,
    commission: 7650,
    growth: "+5%"
  },
  {
    category: "Wellness",
    bookings: 24,
    commission: 6200,
    growth: "+10%"
  }
]

export const CommissionTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Bookings</TableHead>
          <TableHead className="text-right">Commission (THB)</TableHead>
          <TableHead className="text-right">Monthly Growth</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.category}>
            <TableCell className="font-medium">{row.category}</TableCell>
            <TableCell className="text-right">{row.bookings}</TableCell>
            <TableCell className="text-right">฿{row.commission.toLocaleString()}</TableCell>
            <TableCell className="text-right text-green-600">{row.growth}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

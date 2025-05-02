import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";
// import { Booking } from "@/services/activityService"; // Ensure Booking type is imported if needed

interface Booking {
  id: string; // Assuming booking ID is string
  activityName: string;
  customerName: string;
  date: Date;
  amount: number;
  status: "confirmed" | "pending" | "cancelled"; // Match component's status type
}

interface RecentBookingsProps {
  // @ Update prop type to match the interface above
  bookings?: Booking[]; 
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  // Default data if none provided (can be removed if always passing data)
  const defaultBookings: Booking[] = [
    {
      id: "B-1001",
      activityName: "Doi Suthep Temple Tour",
      customerName: "John Smith",
      date: subDays(new Date(), 2),
      amount: 3500,
      status: "confirmed"
    },
    {
      id: "B-1002",
      activityName: "Thai Cooking Class",
      customerName: "Emma Johnson",
      date: subDays(new Date(), 3),
      amount: 2800,
      status: "confirmed"
    },
    {
      id: "B-1003",
      activityName: "Elephant Sanctuary Visit",
      customerName: "Michael Brown",
      date: subDays(new Date(), 4),
      amount: 5000,
      status: "pending"
    },
    {
      id: "B-1004",
      activityName: "Night Market Food Tour",
      customerName: "Sarah Wilson",
      date: subDays(new Date(), 7),
      amount: 1800,
      status: "cancelled"
    }
  ];

  // @ Use the passed bookings directly if available, otherwise show empty or default
  const displayBookings = bookings && bookings.length > 0 ? bookings : defaultBookings; 

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>Your latest booking activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium">{booking.activityName}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{booking.customerName}</span>
                  <span className="mx-2">•</span>
                  <span>{format(booking.date, "MMM d, yyyy")}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-medium">฿{booking.amount ? booking.amount.toLocaleString() : '0'}</span>
                <Badge variant={getStatusBadgeVariant(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
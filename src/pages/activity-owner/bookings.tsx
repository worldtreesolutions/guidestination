import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"
import { supabaseActivityService } from "@/services/supabaseActivityService";
import { Booking } from "@/types/activity";

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/activity-owner/login");
      return;
    }

    const fetchBookings = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const ownerBookings = await supabaseActivityService.fetchBookingsForOwner(user.id);
          setBookings(ownerBookings);
        } catch (error: any) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookings();
  }, [user, isAuthenticated, router, toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBookings(bookings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = bookings.filter(booking => 
      booking.activities.title.toLowerCase().includes(query) ||
      booking.user_id.toLowerCase().includes(query)
    );
    
    setFilteredBookings(filtered);
  }, [searchQuery, bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      default:
        return "";
    }
  };

  const pendingBookings = filteredBookings.filter(b => b.status === "pending");
  const confirmedBookings = filteredBookings.filter(b => b.status === "confirmed");
  const completedBookings = filteredBookings.filter(b => b.status === "completed");
  const cancelledBookings = filteredBookings.filter(b => b.status === "cancelled");

  if (loading) {
    return (
      // Use DashboardLayout instead of ProviderLayout
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading bookings...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      // Use DashboardLayout instead of ProviderLayout
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Manage Bookings - Guidestination</title>
        <meta name="description" content="Manage your activity bookings" />
      </Head>

      {/* Use DashboardLayout instead of ProviderLayout */}
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              Manage your customer reservations
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bookings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({filteredBookings.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <BookingTable 
                bookings={filteredBookings} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-6">
              <BookingTable 
                bookings={pendingBookings} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            
            <TabsContent value="confirmed" className="mt-6">
              <BookingTable 
                bookings={confirmedBookings} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              <BookingTable 
                bookings={completedBookings} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-6">
              <BookingTable 
                bookings={cancelledBookings} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}

interface BookingTableProps {
  bookings: Booking[];
  getStatusColor: (status: string) => string;
}

function BookingTable({ bookings, getStatusColor }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No bookings found</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.activities.title}</TableCell>
                <TableCell>
                  <div>{booking.customerName}</div>
                  <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                </TableCell>
                <TableCell>
                  <div>{new Date(booking.date).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">{booking.bookingTime}</div>
                </TableCell>
                <TableCell>{booking.participants}</TableCell>
                <TableCell>
                  <div>฿{booking.providerAmount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    After {((booking.platformFee / booking.totalAmount) * 100).toFixed(0)}% fee
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)} variant="outline">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

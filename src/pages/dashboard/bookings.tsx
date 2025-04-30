import { useState, useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Mock data for bookings
const mockBookings = [
  {
    id: "B-1001",
    activityName: "Doi Suthep Temple & Hmong Village Tour",
    customerName: "John Smith",
    date: new Date(2025, 4, 15),
    participants: 2,
    totalAmount: 3000,
    status: "confirmed"
  },
  {
    id: "B-1002",
    activityName: "Traditional Thai Cooking Class",
    customerName: "Emma Johnson",
    date: new Date(2025, 4, 16),
    participants: 4,
    totalAmount: 4800,
    status: "confirmed"
  },
  {
    id: "B-1003",
    activityName: "Elephant Nature Park Sanctuary Experience",
    customerName: "Michael Brown",
    date: new Date(2025, 4, 18),
    participants: 3,
    totalAmount: 7500,
    status: "pending"
  },
  {
    id: "B-1004",
    activityName: "Night Market Food Tour & Local Delicacies",
    customerName: "Sarah Wilson",
    date: new Date(2025, 4, 20),
    participants: 2,
    totalAmount: 2000,
    status: "confirmed"
  },
  {
    id: "B-1005",
    activityName: "Mountain Biking Adventure in Doi Suthep",
    customerName: "David Lee",
    date: new Date(2025, 4, 22),
    participants: 1,
    totalAmount: 2200,
    status: "cancelled"
  },
  {
    id: "B-1006",
    activityName: "Thai Massage Workshop at Traditional Spa",
    customerName: "Jennifer Garcia",
    date: new Date(2025, 4, 25),
    participants: 2,
    totalAmount: 3600,
    status: "confirmed"
  },
  {
    id: "B-1007",
    activityName: "Meditation Retreat at Buddhist Temple",
    customerName: "Robert Martinez",
    date: new Date(2025, 4, 28),
    participants: 1,
    totalAmount: 1600,
    status: "pending"
  }
]

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState(mockBookings)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
    }
  }, [isAuthenticated, router])

  // Filter bookings based on search query, status, and date range
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchLower) ||
      booking.activityName.toLowerCase().includes(searchLower) ||
      booking.customerName.toLowerCase().includes(searchLower)
    
    // Status filter
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    
    // Date filter
    let matchesDate = true
    if (dateRange?.from) {
      matchesDate = booking.date >= dateRange.from
      if (dateRange.to) {
        matchesDate = matchesDate && booking.date <= dateRange.to
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    alert("Exporting bookings to CSV...")
  }

  return (
    <>
      <Head>
        <title>Bookings - Dashboard</title>
        <meta name="description" content="Manage your activity bookings" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
              <p className="text-muted-foreground">
                View and manage all your activity bookings.
              </p>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <TabsList className="mb-2 sm:mb-0">
                <TabsTrigger value="all">All Bookings</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search bookings..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd")
                          )
                        ) : (
                          "Date Range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={new Date()}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.length > 0 ? (
                          filteredBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">{booking.id}</TableCell>
                              <TableCell>{booking.activityName}</TableCell>
                              <TableCell>{booking.customerName}</TableCell>
                              <TableCell>{format(booking.date, "MMM d, yyyy")}</TableCell>
                              <TableCell>{booking.participants}</TableCell>
                              <TableCell>฿{booking.totalAmount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(booking.status)}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                    <DropdownMenuItem>Cancel Booking</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                              No bookings found matching your filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming" className="m-0">
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Upcoming bookings view will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="past" className="m-0">
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Past bookings view will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  )
}
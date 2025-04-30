
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
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Search, Download, MoreHorizontal, Mail, Phone, MapPin, Calendar, DollarSign } from "lucide-react"
import { format, subDays } from "date-fns"

// Mock data for customers
const mockCustomers = [
  {
    id: "C-1001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    totalSpent: 7500,
    bookings: 3,
    lastBooking: subDays(new Date(), 5),
    status: "active"
  },
  {
    id: "C-1002",
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
    phone: "+1 (555) 234-5678",
    location: "London, UK",
    totalSpent: 4800,
    bookings: 2,
    lastBooking: subDays(new Date(), 10),
    status: "active"
  },
  {
    id: "C-1003",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1 (555) 345-6789",
    location: "Sydney, Australia",
    totalSpent: 3500,
    bookings: 1,
    lastBooking: subDays(new Date(), 15),
    status: "inactive"
  },
  {
    id: "C-1004",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+1 (555) 456-7890",
    location: "Toronto, Canada",
    totalSpent: 6200,
    bookings: 3,
    lastBooking: subDays(new Date(), 8),
    status: "active"
  },
  {
    id: "C-1005",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "+1 (555) 567-8901",
    location: "Singapore",
    totalSpent: 2200,
    bookings: 1,
    lastBooking: subDays(new Date(), 20),
    status: "inactive"
  },
  {
    id: "C-1006",
    name: "Jennifer Garcia",
    email: "jennifer.garcia@example.com",
    phone: "+1 (555) 678-9012",
    location: "Barcelona, Spain",
    totalSpent: 9800,
    bookings: 4,
    lastBooking: subDays(new Date(), 3),
    status: "active"
  },
  {
    id: "C-1007",
    name: "Robert Martinez",
    email: "robert.martinez@example.com",
    phone: "+1 (555) 789-0123",
    location: "Paris, France",
    totalSpent: 3200,
    bookings: 2,
    lastBooking: subDays(new Date(), 12),
    status: "active"
  }
]

export default function CustomersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState(mockCustomers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
    }
  }, [isAuthenticated, router])

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.location.toLowerCase().includes(searchLower) ||
      customer.id.toLowerCase().includes(searchLower)
    )
  })

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    alert("Exporting customers to CSV...")
  }

  const handleViewCustomer = (customer: typeof mockCustomers[0]) => {
    setSelectedCustomer(customer)
  }

  return (
    <>
      <Head>
        <title>Customers - Dashboard</title>
        <meta name="description" content="Manage your customer relationships" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
              <p className="text-muted-foreground">
                View and manage your customer relationships.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4" />
              </Button>
              <Button>Add Customer</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer List */}
            <Card className={`lg:col-span-${selectedCustomer ? "2" : "3"}`}>
              <CardHeader>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>
                  {filteredCustomers.length} total customers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Spent</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id} className="cursor-pointer" onClick={() => handleViewCustomer(customer)}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{customer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{customer.location}</TableCell>
                            <TableCell>฿{customer.totalSpent.toLocaleString()}</TableCell>
                            <TableCell>{customer.bookings}</TableCell>
                            <TableCell>
                              <Badge variant={customer.status === "active" ? "outline" : "secondary"}>
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewCustomer(customer);
                                  }}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    Send Email
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No customers found matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            {selectedCustomer && (
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Customer Details</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarFallback className="text-xl">
                        {selectedCustomer.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                    <Badge variant={selectedCustomer.status === "active" ? "outline" : "secondary"} className="mt-1">
                      {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total Spent</span>
                      </div>
                      <span className="font-medium">฿{selectedCustomer.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bookings</span>
                      </div>
                      <span className="font-medium">{selectedCustomer.bookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last Booking</span>
                      </div>
                      <span className="font-medium">{format(selectedCustomer.lastBooking, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Bookings
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

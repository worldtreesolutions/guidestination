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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Activity } from "lucide-react"
import { format, subDays, subMonths } from "date-fns"
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

// Mock data for revenue statistics
const mockRevenueStats = {
  totalRevenue: 125000,
  bookings: 48,
  averageBookingValue: 2604,
  customers: 42,
  monthlyRevenue: [
    { month: "Jan", revenue: 8500 },
    { month: "Feb", revenue: 12000 },
    { month: "Mar", revenue: 15500 },
    { month: "Apr", revenue: 18000 },
    { month: "May", revenue: 22000 },
    { month: "Jun", revenue: 19500 },
    { month: "Jul", revenue: 16000 },
    { month: "Aug", revenue: 13500 },
  ],
  topActivities: [
    { name: "Elephant Nature Park Sanctuary Experience", revenue: 37500, bookings: 15 },
    { name: "Traditional Thai Cooking Class", revenue: 24000, bookings: 20 },
    { name: "Doi Suthep Temple & Hmong Village Tour", revenue: 22500, bookings: 15 },
    { name: "Thai Massage Workshop", revenue: 18000, bookings: 10 },
    { name: "Night Market Food Tour", revenue: 15000, bookings: 15 },
  ],
  recentTransactions: [
    { id: "T-1001", date: subDays(new Date(), 2), activity: "Elephant Nature Park", customer: "John Smith", amount: 7500, status: "completed" },
    { id: "T-1002", date: subDays(new Date(), 3), activity: "Thai Cooking Class", customer: "Emma Johnson", amount: 4800, status: "completed" },
    { id: "T-1003", date: subDays(new Date(), 5), activity: "Doi Suthep Tour", customer: "Michael Brown", amount: 4500, status: "completed" },
    { id: "T-1004", date: subDays(new Date(), 7), activity: "Night Market Food Tour", customer: "Sarah Wilson", amount: 2000, status: "completed" },
    { id: "T-1005", date: subDays(new Date(), 10), activity: "Thai Massage Workshop", customer: "David Lee", amount: 3600, status: "refunded" },
  ]
}

export default function RevenuePage() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30days")
  const [revenueStats, setRevenueStats] = useState(mockRevenueStats)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
    }
  }, [isAuthenticated, router])

  // In a real app, this would fetch data based on the selected time range
  useEffect(() => {
    // This is just a mock implementation
    // In a real app, you would fetch data from your API
    console.log(`Fetching revenue data for ${timeRange}`)
    // For now, we'll just use the same mock data
  }, [timeRange])

  const handleExportReport = () => {
    // In a real app, this would generate and download a report
    alert("Exporting revenue report...")
  }

  return (
    <>
      <Head>
        <title>{t("dashboard.revenue.title") || "Revenue - Dashboard"}</title>
        <meta name="description" content={t("dashboard.revenue.description") || "Track your revenue and financial performance"} />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.revenue.manage") || "Revenue"}</h1>
              <p className="text-muted-foreground">
                {t("dashboard.revenue.subtitle") || "Track your financial performance and revenue metrics."}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("dashboard.revenue.selectPeriod") || "Select period"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">{t("dashboard.revenue.last7Days") || "Last 7 days"}</SelectItem>
                  <SelectItem value="30days">{t("dashboard.revenue.last30Days") || "Last 30 days"}</SelectItem>
                  <SelectItem value="90days">{t("dashboard.revenue.last90Days") || "Last 90 days"}</SelectItem>
                  <SelectItem value="year">{t("dashboard.revenue.thisYear") || "This year"}</SelectItem>
                  <SelectItem value="all">{t("dashboard.revenue.allTime") || "All time"}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="mr-2 h-4 w-4" />
                {t("dashboard.revenue.export") || "Export"}
              </Button>
            </div>
          </div>

          {/* Revenue Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.revenue.totalRevenue") || "Total Revenue"}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{revenueStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-4 w-4 text-green-500 mr-1" />
                  +12.5% from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.revenue.bookings") || "Bookings"}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueStats.bookings}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-4 w-4 text-green-500 mr-1" />
                  {t("dashboard.revenue.percentageIncrease") || "+8.2% from previous period"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.revenue.averageBookingValue") || "Average Booking Value"}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{revenueStats.averageBookingValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-4 w-4 text-green-500 mr-1" />
                  {t("dashboard.revenue.percentageIncrease2") || "+3.1% from previous period"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.revenue.customers") || "Customers"}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueStats.customers}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingDown className="inline h-4 w-4 text-red-500 mr-1" />
                  {t("dashboard.revenue.percentageDecrease") || "-2.5% from previous period"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("dashboard.revenue.revenueOverTime") || "Revenue Over Time"}</CardTitle>
                <CardDescription>{t("dashboard.revenue.monthlyBreakdown") || "Monthly revenue breakdown"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between">
                  {revenueStats.monthlyRevenue.map((month) => (
                    <div key={month.month} className="flex flex-col items-center">
                      <div 
                        className="bg-primary w-12 rounded-t-md" 
                        style={{ 
                          height: `${(month.revenue / Math.max(...revenueStats.monthlyRevenue.map(m => m.revenue))) * 250}px` 
                        }}
                      ></div>
                      <div className="mt-2 text-xs">{month.month}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Activities */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.revenue.topActivities") || "Top Activities"}</CardTitle>
                <CardDescription>{t("dashboard.revenue.byRevenue") || "By revenue"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStats.topActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none truncate max-w-[180px]">
                          {activity.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.bookings} {t("dashboard.revenue.bookingsText") || "bookings"}
                        </p>
                      </div>
                      <div className="font-medium">
                        ฿{activity.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">{t("dashboard.revenue.viewAllActivities") || "View All Activities"}</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent revenue transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueStats.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{format(transaction.date, "MMM d, yyyy")}</TableCell>
                      <TableCell>{transaction.activity}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>฿{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          transaction.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Transactions</Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    </>
  )
}

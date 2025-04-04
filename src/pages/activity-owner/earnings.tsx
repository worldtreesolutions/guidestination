
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { ProviderLayout } from "@/components/activity-owner/layout/ProviderLayout"
import { activityService, Booking } from "@/services/activityService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts"
import { CreditCard, TrendingUp, DollarSign, Calendar } from "lucide-react"

export default function EarningsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<{
    total: number;
    monthly: { month: string; amount: number }[];
    pending: number;
  }>({
    total: 0,
    monthly: [],
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/activity-owner/login");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [bookingsData, earningsData] = await Promise.all([
          activityService.getBookingsByProvider(user.id),
          activityService.getProviderEarnings(user.id)
        ]);
        
        setBookings(bookingsData);
        setEarnings(earningsData);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
        toast({
          title: "Error",
          description: "Failed to load earnings data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, router, toast]);

  // Generate daily earnings data for the current month
  const generateDailyData = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dailyData = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      // Random value between 500 and 5000
      const amount = Math.floor(Math.random() * 4500) + 500;
      dailyData.push({
        day: i,
        amount
      });
    }
    
    return dailyData;
  };

  const dailyData = generateDailyData();

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading earnings data...</p>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Earnings - Guidestination</title>
        <meta name="description" content="Track your earnings from activities" />
      </Head>

      <ProviderLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
            <p className="text-muted-foreground">
              Track your revenue and financial performance
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{earnings.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{earnings.monthly[3].amount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{earnings.pending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From upcoming bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Booking</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{bookings.length > 0 
                    ? Math.round(bookings.reduce((sum, b) => sum + b.providerAmount, 0) / bookings.length).toLocaleString() 
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per reservation
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="monthly" className="w-full">
            <TabsList>
              <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
              <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                  <CardDescription>
                    Your earnings over the past months
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={earnings.monthly}>
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `฿${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`฿${value.toLocaleString()}`, 'Earnings']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar
                        dataKey="amount"
                        fill="currentColor"
                        radius={[4, 4, 0, 0]}
                        className="fill-primary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="daily" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Earnings (This Month)</CardTitle>
                  <CardDescription>
                    Your daily earnings for the current month
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dailyData}>
                      <XAxis
                        dataKey="day"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `฿${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`฿${value.toLocaleString()}`, 'Earnings']}
                        labelFormatter={(label) => `Day ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Your recent earnings from bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Your Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings
                        .filter(b => b.status === "confirmed" || b.status === "completed")
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 10)
                        .map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{booking.activityTitle}</TableCell>
                            <TableCell>{booking.customerName}</TableCell>
                            <TableCell>{booking.participants}</TableCell>
                            <TableCell>฿{booking.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>฿{booking.platformFee.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">฿{booking.providerAmount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ProviderLayout>
    </>
  );
}


import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { activityService } from "@/services/activityService"
import { useToast } from "@/hooks/use-toast"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  BarChart, 
  LineChart 
} from "@/components/ui/chart"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Calendar, 
  CreditCard 
} from "lucide-react"

export default function EarningsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [earnings, setEarnings] = useState<{
    total: number
    monthly: { month: string; amount: number }[]
    pending: number
    transactions: {
      id: string
      date: string
      description: string
      amount: number
      status: string
    }[]
  }>({
    total: 0,
    monthly: [],
    pending: 0,
    transactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
      return
    }

    const fetchEarnings = async () => {
      if (!user) return
      
      try {
        const earningsData = await activityService.getProviderEarnings(user.id)
        setEarnings(earningsData)
      } catch (error) {
        console.error("Error fetching earnings:", error)
        toast({
          title: "Error",
          description: "Failed to load earnings data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [user, isAuthenticated, router, toast])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading earnings data...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Calculate percentage change from previous month
  const calculateChange = () => {
    if (earnings.monthly.length < 2) return 0
    
    const currentMonth = earnings.monthly[earnings.monthly.length - 1].amount
    const previousMonth = earnings.monthly[earnings.monthly.length - 2].amount
    
    if (previousMonth === 0) return 100
    
    return ((currentMonth - previousMonth) / previousMonth) * 100
  }

  const percentageChange = calculateChange()

  return (
    <>
      <Head>
        <title>Earnings - Provider Dashboard</title>
        <meta name="description" content="Track your earnings and financial performance" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
            <p className="text-muted-foreground">
              Track your revenue, payouts, and financial performance.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnings.total.toLocaleString()} THB</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime earnings from all activities
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {earnings.monthly.length > 0 
                    ? earnings.monthly[earnings.monthly.length - 1].amount.toLocaleString() 
                    : 0} THB
                </div>
                <div className="flex items-center pt-1">
                  {percentageChange > 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <p className={`text-xs ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(percentageChange).toFixed(1)}% from last month
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Payouts
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnings.pending.toLocaleString()} THB</div>
                <p className="text-xs text-muted-foreground">
                  Will be transferred within 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commission Rate
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15%</div>
                <p className="text-xs text-muted-foreground">
                  Standard rate for all activities
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>
                    Your earnings over the past 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <BarChart 
                    data={earnings.monthly.map(item => ({
                      name: item.month,
                      total: item.amount
                    }))}
                    categories={["total"]}
                    index="name"
                    colors={["#22C55E"]}
                    valueFormatter={(value) => `${value.toLocaleString()} THB`}
                    yAxisWidth={60}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your most recent earnings and payouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {earnings.transactions.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No transactions to display
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {earnings.transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.amount.toLocaleString()} THB</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : transaction.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  )
}

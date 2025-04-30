import { User } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, CreditCard, TrendingUp } from "lucide-react"

interface DashboardHeaderProps {
  user?: User | null;
  stats: {
    totalActivities: number;
    totalBookings: number;
    totalEarnings: number;
    pendingEarnings: number;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  // Mock stats for display
  const mockStats = {
    totalActivities: 12,
    totalBookings: 48,
    totalEarnings: 125000,
    pendingEarnings: 35000
  };

  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome back, {user?.name || 'Provider'}! Here's an overview of your business.
        </p>
      </div>
      <div className='flex gap-2 w-full sm:w-auto'>
        <div className='flex flex-col sm:flex-row gap-2'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col items-center justify-center p-3 bg-muted rounded-lg'>
              <span className='text-sm text-muted-foreground'>Bookings</span>
              <span className='text-2xl font-bold'>24</span>
            </div>
            <div className='flex flex-col items-center justify-center p-3 bg-muted rounded-lg'>
              <span className='text-sm text-muted-foreground'>Revenue</span>
              <span className='text-2xl font-bold'>฿48K</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              Listed experiences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{mockStats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              After platform fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{mockStats.pendingEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From upcoming bookings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
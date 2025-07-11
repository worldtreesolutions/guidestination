
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, CreditCard, Activity as ActivityIcon } from "lucide-react"

interface DashboardHeaderProps {
  stats: {
    totalEarnings: number
    totalBookings: number
    pendingEarnings: number
    totalActivities: number
  }
}

export function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalEarnings.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on confirmed bookings
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.totalBookings}</div>
          <p className="text-xs text-muted-foreground">
            All time bookings received
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Activities
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.totalActivities}</div>
          <p className="text-xs text-muted-foreground">
            Your listed activities
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.pendingEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From unconfirmed bookings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
  
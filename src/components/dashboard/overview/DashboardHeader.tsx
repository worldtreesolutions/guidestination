
import { Card, CardContent } from "@/components/ui/card"
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  Package 
} from "lucide-react"

interface DashboardHeaderProps {
  user: {
    id: string
    displayName?: string
    email?: string
    photoURL?: string
  }
  stats: {
    totalActivities: number
    totalBookings: number
    totalEarnings: number
    pendingEarnings: number
  }
}

export function DashboardHeader({ user, stats }: DashboardHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.displayName || 'Provider'}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your activity business
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Activities
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.totalActivities}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.totalBookings}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.totalEarnings.toLocaleString()} THB
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Earnings
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.pendingEarnings.toLocaleString()} THB
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Users, Hotel, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingActivityProviders: 0,
    pendingHotels: 0,
    totalActivityProviders: 0,
    totalHotels: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch pending activity providers
      const { count: pendingActivityProviders } = await supabase
        .from('activity_owners')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false);

      // Fetch total activity providers
      const { count: totalActivityProviders } = await supabase
        .from('activity_owners')
        .select('*', { count: 'exact', head: true });

      // Fetch pending hotels
      const { count: pendingHotels } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false);

      // Fetch total hotels
      const { count: totalHotels } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true });

      setStats({
        pendingActivityProviders: pendingActivityProviders || 0,
        pendingHotels: pendingHotels || 0,
        totalActivityProviders: totalActivityProviders || 0,
        totalHotels: totalHotels || 0
      });
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Activity Providers
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActivityProviders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activity Providers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivityProviders}</div>
            <p className="text-xs text-muted-foreground">
              Registered in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Hotels
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingHotels}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hotels
            </CardTitle>
            <Hotel className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHotels}</div>
            <p className="text-xs text-muted-foreground">
              Registered in the system
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Welcome to the admin portal. Use the sidebar to navigate to different sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

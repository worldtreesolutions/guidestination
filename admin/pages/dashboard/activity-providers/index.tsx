import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '../../../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';

interface ActivityProvider {
  id: string;
  user_id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  created_at: string;
  verified: boolean;
}

export default function ActivityProviders() {
  const [activityProviders, setActivityProviders] = useState<ActivityProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityProviders();
  }, []);

  const fetchActivityProviders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_owners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivityProviders(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch activity providers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('activity_owners')
        .update({ verified })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setActivityProviders(
        activityProviders.map((provider) =>
          provider.id === id ? { ...provider, verified } : provider
        )
      );

      toast.success(
        verified
          ? 'Activity provider verified successfully'
          : 'Activity provider verification revoked'
      );
    } catch (error: any) {
      toast.error('Failed to update verification status: ' + error.message);
    }
  };

  return (
    <DashboardLayout title="Activity Providers">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Manage and verify activity providers
          </p>
        </div>
        <Button onClick={fetchActivityProviders} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  {loading ? 'Loading...' : 'No activity providers found'}
                </TableCell>
              </TableRow>
            ) : (
              activityProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.business_name}</TableCell>
                  <TableCell>{provider.contact_name}</TableCell>
                  <TableCell>{provider.email}</TableCell>
                  <TableCell>{provider.phone}</TableCell>
                  <TableCell>{formatDate(provider.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={provider.verified ? 'success' : 'warning'}>
                      {provider.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {provider.verified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(provider.id, false)}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(provider.id, true)}
                      >
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
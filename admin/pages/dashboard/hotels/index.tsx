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

interface Hotel {
  id: string;
  user_id: string;
  hotel_name: string;
  contact_name: string;
  email: string;
  phone: string;
  created_at: string;
  verified: boolean;
}

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch hotels: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .update({ verified })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setHotels(
        hotels.map((hotel) =>
          hotel.id === id ? { ...hotel, verified } : hotel
        )
      );

      toast.success(
        verified
          ? 'Hotel verified successfully'
          : 'Hotel verification revoked'
      );
    } catch (error: any) {
      toast.error('Failed to update verification status: ' + error.message);
    }
  };

  return (
    <DashboardLayout title="Hotels">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Manage and verify hotels
          </p>
        </div>
        <Button onClick={fetchHotels} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  {loading ? 'Loading...' : 'No hotels found'}
                </TableCell>
              </TableRow>
            ) : (
              hotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">{hotel.hotel_name}</TableCell>
                  <TableCell>{hotel.contact_name}</TableCell>
                  <TableCell>{hotel.email}</TableCell>
                  <TableCell>{hotel.phone}</TableCell>
                  <TableCell>{formatDate(hotel.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={hotel.verified ? 'success' : 'warning'}>
                      {hotel.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {hotel.verified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(hotel.id, false)}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(hotel.id, true)}
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
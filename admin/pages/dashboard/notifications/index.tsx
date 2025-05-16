
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'activity_provider' | 'hotel';
  entity_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch notifications
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch notifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );

      toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error('Failed to update notification: ' + error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );

      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error('Failed to update notifications: ' + error.message);
    }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            View and manage system notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={loading || notifications.every(n => n.read)}>
            Mark All as Read
          </Button>
          <Button onClick={fetchNotifications} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {loading ? 'Loading notifications...' : 'No notifications found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} className={notification.read ? '' : 'bg-blue-50 dark:bg-blue-900/10'}>
                  <TableCell>
                    <Badge variant={notification.type === 'activity_provider' ? 'pending' : 'secondary'}>
                      {notification.type === 'activity_provider' ? 'Activity Provider' : 'Hotel'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{notification.message}</TableCell>
                  <TableCell>{formatDate(notification.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={notification.read ? 'outline' : 'default'}>
                      {notification.read ? 'Read' : 'Unread'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Link href={`/dashboard/${notification.type === 'activity_provider' ? 'activity-providers' : 'hotels'}`}>
                        <Button size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}

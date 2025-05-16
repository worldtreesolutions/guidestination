
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const router = useRouter();
  const [emailSettings, setEmailSettings] = useState({
    notificationEmail: 'admin@example.com',
    emailEnabled: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // Only super admins can access this page
  if (!isSuperAdmin) {
    router.push('/dashboard');
    return null;
  }

  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Email settings saved successfully');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Configure email settings for admin notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveEmailSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={emailSettings.notificationEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, notificationEmail: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="emailEnabled"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={emailSettings.emailEnabled}
                  onChange={(e) => setEmailSettings({ ...emailSettings, emailEnabled: e.target.checked })}
                />
                <Label htmlFor="emailEnabled">Enable email notifications</Label>
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Information</CardTitle>
            <CardDescription>
              Information about deploying this admin portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Deployment Instructions</h3>
              <div className="bg-muted p-4 rounded-md text-sm">
                <p className="mb-2">This admin portal is designed to be deployed as a standalone application on a subdomain:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Set up a subdomain (e.g., admin.yourdomain.com) pointing to your hosting service</li>
                  <li>Configure environment variables for Supabase connection</li>
                  <li>Build the application using <code>npm run build</code></li>
                  <li>Deploy the built files to your hosting service</li>
                </ol>
                <p className="mt-2">For more detailed instructions, refer to the documentation.</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Environment Variables</h3>
              <div className="bg-muted p-4 rounded-md text-sm font-mono">
                <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
                <p>SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

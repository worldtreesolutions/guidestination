
import { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const router = useRouter();
  const [emailSettings, setEmailSettings] = useState({
    notificationEmail: 'admin@example.com',
    emailEnabled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [changeRequestOpen, setChangeRequestOpen] = useState(false);
  const [changeRequestMessage, setChangeRequestMessage] = useState('');

  // Mock business details
  const businessDetails = {
    businessName: "Mountain Trek Tours",
    businessType: "Tour Operator",
    registrationNumber: "BRN-12345678",
    taxId: "TAX-9876543",
    address: "123 Adventure Road, Chiang Mai, Thailand",
    phone: "+66 123 456 789",
    email: "info@mountaintrek.com",
    website: "https://www.mountaintrek.com",
    description: "We offer guided mountain treks and adventure tours in Northern Thailand."
  };

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

  const handleSubmitChangeRequest = () => {
    if (!changeRequestMessage.trim()) {
      toast.error('Please provide details for your change request');
      return;
    }

    // Simulate API call to submit change request
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Change request submitted successfully');
      setChangeRequestMessage('');
      setChangeRequestOpen(false);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="grid gap-6">
        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="mt-4">
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
          </TabsContent>
          
          <TabsContent value="business" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>
                  Your business information as registered in our system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessDetails.businessName}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input
                      id="businessType"
                      value={businessDetails.businessType}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={businessDetails.registrationNumber}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={businessDetails.taxId}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={businessDetails.address}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={businessDetails.phone}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={businessDetails.email}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={businessDetails.website}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      value={businessDetails.description}
                      readOnly
                      className="bg-muted cursor-not-allowed h-24"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Dialog open={changeRequestOpen} onOpenChange={setChangeRequestOpen}>
                  <DialogTrigger asChild>
                    <Button>Request Changes</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Business Information Changes</DialogTitle>
                      <DialogDescription>
                        Please provide details about the changes you need to make to your business information. Our admin team will review your request.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="changeDetails">Change Details</Label>
                        <Textarea
                          id="changeDetails"
                          placeholder="Please describe the changes you need to make to your business information..."
                          value={changeRequestMessage}
                          onChange={(e) => setChangeRequestMessage(e.target.value)}
                          className="h-32"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setChangeRequestOpen(false)}>Cancel</Button>
                      <Button onClick={handleSubmitChangeRequest} disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

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

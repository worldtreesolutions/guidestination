import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Lock, 
  HelpCircle, 
  Upload,
  Save,
  Loader2,
  Plus,
  X
} from 'lucide-react'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/dashboard/login')
    }
  }, [isAuthenticated, router])

  const handleSaveProfile = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Show success message
      alert('Profile settings saved successfully!')
    }, 1000)
  }

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get form data
    const form = e.target as HTMLFormElement
    const cardholderName = (form.elements.namedItem('cardholderName') as HTMLInputElement).value
    const cardNumber = (form.elements.namedItem('cardNumber') as HTMLInputElement).value
    const expiryDate = (form.elements.namedItem('expiryDate') as HTMLInputElement).value
    const cvv = (form.elements.namedItem('cvv') as HTMLInputElement).value
    
    // Create new payment method object
    const newPaymentMethod = {
      id: Date.now().toString(),
      cardholderName,
      cardNumber: cardNumber.replace(/\d(?=\d{4})/g, '*'), // Mask card number
      expiryDate,
      type: getCardType(cardNumber),
    }
    
    // Add to payment methods array
    setPaymentMethods([...paymentMethods, newPaymentMethod])
    
    // Hide form
    setShowPaymentForm(false)
    
    // Reset form
    form.reset()
  }

  const getCardType = (cardNumber: string) => {
    // Simple card type detection based on first digit
    const firstDigit = cardNumber.charAt(0)
    if (firstDigit === '4') return 'Visa'
    if (firstDigit === '5') return 'MasterCard'
    if (firstDigit === '3') return 'American Express'
    if (firstDigit === '6') return 'Discover'
    return 'Credit Card'
  }

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id))
  }

  return (
    <>
      <Head>
        <title>Settings - Dashboard</title>
        <meta name='description' content='Manage your account settings' />
      </Head>

      <DashboardLayout>
        <div className='space-y-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
            <p className='text-muted-foreground'>
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs defaultValue='profile' value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
            <div className='flex overflow-x-auto pb-2'>
              <TabsList className='inline-flex h-auto p-1 gap-1'>
                <TabsTrigger value='profile' className='flex items-center gap-2 px-3 py-2'>
                  <User className='h-4 w-4' />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value='business' className='flex items-center gap-2 px-3 py-2'>
                  <Building className='h-4 w-4' />
                  <span>Business</span>
                </TabsTrigger>
                <TabsTrigger value='billing' className='flex items-center gap-2 px-3 py-2'>
                  <CreditCard className='h-4 w-4' />
                  <span>Billing</span>
                </TabsTrigger>
                <TabsTrigger value='notifications' className='flex items-center gap-2 px-3 py-2'>
                  <Bell className='h-4 w-4' />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value='security' className='flex items-center gap-2 px-3 py-2'>
                  <Lock className='h-4 w-4' />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value='support' className='flex items-center gap-2 px-3 py-2'>
                  <HelpCircle className='h-4 w-4' />
                  <span>Support</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile Settings */}
            <TabsContent value='profile' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='flex flex-col sm:flex-row gap-6 items-start'>
                    <div className='flex flex-col items-center gap-2'>
                      <Avatar className='h-24 w-24'>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Button variant='outline' size='sm' className='mt-2'>
                        <Upload className='h-4 w-4 mr-2' />
                        Change
                      </Button>
                    </div>
                    <div className='grid gap-4 flex-1'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='firstName'>First Name</Label>
                          <Input id='firstName' defaultValue='John' />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='lastName'>Last Name</Label>
                          <Input id='lastName' defaultValue='Doe' />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input id='email' type='email' defaultValue='john.doe@example.com' />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='phone'>Phone Number</Label>
                        <Input id='phone' type='tel' defaultValue='+1 (555) 123-4567' />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-2'>
                    <Label htmlFor='bio'>Bio</Label>
                    <Textarea
                      id='bio'
                      placeholder='Write a short bio about yourself...'
                      defaultValue='Tour guide and adventure enthusiast with over 5 years of experience leading tours in Chiang Mai.'
                      className='min-h-[120px]'
                    />
                    <p className='text-sm text-muted-foreground'>
                      This will be displayed on your public profile.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className='flex justify-end gap-2'>
                  <Button variant='outline'>Cancel</Button>
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className='mr-2 h-4 w-4' />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Business Settings */}
            <TabsContent value='business' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='businessName'>Business Name</Label>
                    <Input id='businessName' defaultValue='Chiang Mai Adventures' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='businessType'>Business Type</Label>
                    <Select defaultValue='tourOperator'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select business type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='tourOperator'>Tour Operator</SelectItem>
                        <SelectItem value='activityProvider'>Activity Provider</SelectItem>
                        <SelectItem value='guide'>Independent Guide</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='businessAddress'>Business Address</Label>
                    <Textarea
                      id='businessAddress'
                      defaultValue='123 Main Street, Chiang Mai, Thailand, 50000'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='website'>Website</Label>
                    <Input id='website' type='url' defaultValue='https://www.chiangmaiadventures.com' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='taxId'>Tax ID / Business Registration Number</Label>
                    <Input id='taxId' defaultValue='TH1234567890' />
                  </div>
                </CardContent>
                <CardFooter className='flex justify-end gap-2'>
                  <Button variant='outline'>Cancel</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value='billing' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Manage your payment methods and billing preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <Label className='text-base'>Payment Methods</Label>
                      <Button 
                        variant='outline' 
                        size='sm'
                        onClick={() => setShowPaymentForm(!showPaymentForm)}
                      >
                        {showPaymentForm ? (
                          <>
                            <X className='h-4 w-4 mr-2' />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Plus className='h-4 w-4 mr-2' />
                            Add Payment Method
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {showPaymentForm && (
                      <Card>
                        <CardHeader>
                          <CardTitle className='text-lg'>Add New Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form id='paymentForm' onSubmit={handleAddPaymentMethod} className='space-y-4'>
                            <div className='space-y-2'>
                              <Label htmlFor='cardholderName'>Cardholder Name</Label>
                              <Input 
                                id='cardholderName' 
                                name='cardholderName'
                                placeholder='John Doe' 
                                required 
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='cardNumber'>Card Number</Label>
                              <Input 
                                id='cardNumber' 
                                name='cardNumber'
                                placeholder='1234 5678 9012 3456' 
                                required 
                                maxLength={19}
                              />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='space-y-2'>
                                <Label htmlFor='expiryDate'>Expiry Date</Label>
                                <Input 
                                  id='expiryDate' 
                                  name='expiryDate'
                                  placeholder='MM/YY' 
                                  required 
                                  maxLength={5}
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label htmlFor='cvv'>CVV</Label>
                                <Input 
                                  id='cvv' 
                                  name='cvv'
                                  type='password' 
                                  placeholder='123' 
                                  required 
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            <div className='pt-2 flex justify-end gap-2'>
                              <Button 
                                type='button' 
                                variant='outline'
                                onClick={() => setShowPaymentForm(false)}
                              >
                                Cancel
                              </Button>
                              <Button type='submit'>
                                Save Payment Method
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}
                    
                    {paymentMethods.length > 0 ? (
                      <div className='space-y-3'>
                        {paymentMethods.map((method) => (
                          <div key={method.id} className='flex justify-between items-center border rounded-md p-4'>
                            <div className='flex items-center gap-3'>
                              <CreditCard className='h-5 w-5 text-primary' />
                              <div>
                                <p className='font-medium'>{method.type}</p>
                                <p className='text-sm text-muted-foreground'>
                                  {method.cardNumber} • Expires {method.expiryDate}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant='ghost' 
                              size='sm'
                              onClick={() => handleRemovePaymentMethod(method.id)}
                            >
                              <X className='h-4 w-4' />
                              <span className='sr-only'>Remove</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='border rounded-md p-4'>
                        <p className='text-muted-foreground text-center'>No payment methods added yet.</p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className='space-y-2'>
                    <Label>Billing Address</Label>
                    <div className='border rounded-md p-4'>
                      <p>John Doe</p>
                      <p>123 Main Street</p>
                      <p>Chiang Mai, Thailand, 50000</p>
                    </div>
                    <div className='flex justify-end'>
                      <Button variant='outline' size='sm'>Edit</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className='space-y-2'>
                    <Label>Billing History</Label>
                    <div className='border rounded-md p-4'>
                      <p className='text-muted-foreground text-center'>No billing history available.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value='notifications' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label className='text-base'>Email Notifications</Label>
                        <p className='text-sm text-muted-foreground'>
                          Receive email notifications for important updates.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className='space-y-4'>
                      <Label className='text-base'>Email Notification Types</Label>
                      
                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label>New Bookings</Label>
                          <p className='text-sm text-muted-foreground'>
                            Get notified when you receive a new booking.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label>Booking Cancellations</Label>
                          <p className='text-sm text-muted-foreground'>
                            Get notified when a booking is cancelled.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label>Reviews</Label>
                          <p className='text-sm text-muted-foreground'>
                            Get notified when you receive a new review.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label>Marketing Updates</Label>
                          <p className='text-sm text-muted-foreground'>
                            Receive marketing emails and promotions.
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='flex justify-end gap-2'>
                  <Button variant='outline'>Cancel</Button>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value='security' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Change Password</h3>
                    <div className='space-y-2'>
                      <Label htmlFor='currentPassword'>Current Password</Label>
                      <Input id='currentPassword' type='password' />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='newPassword'>New Password</Label>
                      <Input id='newPassword' type='password' />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                      <Input id='confirmPassword' type='password' />
                    </div>
                    <Button className='mt-2'>Update Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Two-Factor Authentication</h3>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label className='text-base'>Enable Two-Factor Authentication</Label>
                        <p className='text-sm text-muted-foreground'>
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Session Management</h3>
                    <div className='border rounded-md p-4'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <p className='font-medium'>Current Session</p>
                          <p className='text-sm text-muted-foreground'>Bangkok, Thailand • Chrome on Windows</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </div>
                    <Button variant='outline'>Sign Out All Devices</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support Settings */}
            <TabsContent value='support' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Support</CardTitle>
                  <CardDescription>
                    Get help with your account or contact our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Contact Support</h3>
                    <div className='space-y-2'>
                      <Label htmlFor='supportSubject'>Subject</Label>
                      <Input id='supportSubject' placeholder='What can we help you with?' />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='supportMessage'>Message</Label>
                      <Textarea
                        id='supportMessage'
                        placeholder='Please describe your issue in detail...'
                        className='min-h-[150px]'
                      />
                    </div>
                    <Button className='mt-2'>Submit Request</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Frequently Asked Questions</h3>
                    <div className='space-y-2'>
                      <div className='border rounded-md p-4'>
                        <h4 className='font-medium'>How do I update my activity details?</h4>
                        <p className='text-sm text-muted-foreground mt-1'>
                          You can update your activity details by going to the Activities section, selecting the activity you want to edit, and clicking on the Edit button.
                        </p>
                      </div>
                      <div className='border rounded-md p-4'>
                        <h4 className='font-medium'>How do I manage bookings?</h4>
                        <p className='text-sm text-muted-foreground mt-1'>
                          You can view and manage all your bookings in the Bookings section. From there, you can confirm, reschedule, or cancel bookings.
                        </p>
                      </div>
                      <div className='border rounded-md p-4'>
                        <h4 className='font-medium'>How do I get paid?</h4>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Payments are processed automatically and transferred to your registered bank account. You can view your payment history in the Revenue section.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  )
}

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import activityOwnerService from '@/services/activityOwnerService'
import { supabase } from '@/integrations/supabase/client' // Ensure Supabase client is imported

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  businessType: z.string().min(1, 'Business type is required'), // Added min(1) validation
  taxId: z.string().min(13, 'Tax ID must be 13 digits'),
  address: z.string().min(10, 'Please enter a complete address'),
  description: z.string().min(50, 'Please provide a detailed description'),
  tourismLicenseNumber: z.string().min(1, 'Tourism Business License number is required'),
  tatLicenseNumber: z.string().optional(),
  guideCardNumber: z.string().optional(),
  insurancePolicy: z.string().min(1, 'Insurance policy number is required'),
  insuranceAmount: z.string().min(1, 'Insurance coverage amount is required'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

export const ActivityOwnerRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      businessType: '',
      taxId: '',
      address: '',
      description: '',
      tourismLicenseNumber: '',
      tatLicenseNumber: '',
      guideCardNumber: '',
      insurancePolicy: '',
      insuranceAmount: '',
      termsAccepted: false,
    },
  })

  // Function to fill the form with test data
  const fillWithTestData = () => {
    form.reset({
      businessName: 'Test Business',
      ownerName: 'Test Owner',
      email: 'test@example.com',
      phone: '1234567890',
      businessType: 'tour_operator',
      taxId: '1234567890123',
      address: 'Test Address, Chiang Mai, Thailand 50000',
      description: 'This is a test description for a tourism business in Chiang Mai. We offer various activities and experiences for tourists visiting the area.',
      tourismLicenseNumber: 'TEST123',
      tatLicenseNumber: 'TAT123',
      guideCardNumber: 'GUIDE123',
      insurancePolicy: 'INS123456',
      insuranceAmount: '1000000',
      termsAccepted: true,
    });
    setDebugInfo('Form filled with test data. You can now submit the form.');
  };

  // Function for direct Supabase submission test
  const testDirectSubmission = async () => {
    setDebugInfo('Testing direct submission to Supabase...');
    setIsSubmitting(true); // Indicate loading state
    
    try {
      const testData = {
        business_name: 'Direct Test Business',
        owner_name: 'Direct Test Owner',
        email: `direct-test-${Date.now()}@example.com`, // Unique email
        phone: '0987654321',
        business_type: 'test_direct',
        tax_id: '9876543210123', // Ensure 13 digits
        address: 'Direct Test Address, Chiang Mai',
        description: 'This is a direct test submission.',
        tourism_license_number: 'DIRECT-TEST-LIC',
        insurance_policy: 'DIRECT-TEST-POLICY',
        insurance_amount: '1500000',
        status: 'pending' // Set default status
      };
      
      setDebugInfo('Sending test data directly to Supabase...');
      console.log('Test ', testData);
      
      const { data, error } = await supabase
        .from('activity_owners')
        .insert(testData)
        .select()
        .single();
        
      console.log('Direct Supabase response:', { data, error });
      
      if (error) {
        setDebugInfo(`Direct test failed: ${error.message} (Code: ${error.code})`);
        console.error('Direct test error:', error);
        toast({
          title: 'Direct Test Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setDebugInfo(`Direct test succeeded! Record ID: ${data.id}`);
        console.log('Direct test success:', data);
        toast({
          title: 'Direct Test Successful',
          description: `Record created with ID: ${data.id}`,
        });
      }
    } catch (err) {
      console.error('Direct test exception:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setDebugInfo(`Direct test exception: ${errorMessage}`);
      toast({
        title: 'Direct Test Exception',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  // Main form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('onSubmit triggered');
    setDebugInfo('onSubmit function triggered');
    setIsSubmitting(true);
    
    try {
      console.log('Submitting values:', values);
      
      const registrationData = {
        business_name: values.businessName,
        owner_name: values.ownerName,
        email: values.email,
        phone: values.phone,
        business_type: values.businessType,
        tax_id: values.taxId, // Already validated by Zod
        address: values.address,
        description: values.description,
        tourism_license_number: values.tourismLicenseNumber,
        tat_license_number: values.tatLicenseNumber || null,
        guide_card_number: values.guideCardNumber || null,
        insurance_policy: values.insurancePolicy,
        insurance_amount: values.insuranceAmount,
        // status will be set by the service or default in DB
      };
      
      console.log('Prepared registration ', registrationData);
      setDebugInfo('Submitting via activityOwnerService...');
      
      const result = await activityOwnerService.registerActivityOwner(registrationData);
      console.log('Registration successful via service, result:', result);
      setDebugInfo(`Registration successful via service! Owner ID: ${result.id}`);
      
      toast({
        title: 'Registration Successful',
        description: 'Your activity owner account has been created. We will review your information.',
      });
      
      form.reset(); // Reset form on success
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'An unexpected error occurred during registration.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
         errorMessage = (error as any).message;
      }
      
      setDebugInfo(`Registration failed: ${errorMessage}`);
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      {/* Pass the correct onSubmit handler to the form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='space-y-4'>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
            <h4 className='font-medium text-yellow-800 mb-2'>Thai Legal Requirements</h4>
            <ul className='text-sm text-yellow-700 space-y-1'>
              <li>• Tourism Business License from Ministry of Tourism</li>
              <li>• TAT License for specific activities</li>
              <li>• Minimum 1,000,000 THB liability insurance</li>
              <li>• Guide Card for tour guides (if applicable)</li>
            </ul>
          </div>

          <h3 className='text-lg font-medium'>Business Information</h3>
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tour_operator">Tour Operator</SelectItem>
                    <SelectItem value="activity_provider">Activity Provider</SelectItem>
                    <SelectItem value="experience_host">Experience Host</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
           <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID (13 digits)</FormLabel>
                <FormControl>
                  <Input placeholder="Your 13-digit Tax ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='tourismLicenseNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tourism Business License Number</FormLabel>
                  <FormControl>
                    <Input placeholder='License number from Ministry of Tourism' {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for all tourism businesses in Thailand
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tatLicenseNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TAT License Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Tourism Authority of Thailand License' {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for specific tourism activities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your business and the activities you offer (min. 50 characters)"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Contact Information</h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+66XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Full address in Chiang Mai"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Legal & Insurance</h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='insurancePolicy'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Policy Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Tourism liability insurance number' {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be valid tourism liability insurance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='insuranceAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Coverage Amount (THB)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder='Minimum 1,000,000 THB' {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum required coverage: 1,000,000 THB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='guideCardNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Guide Card Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder='Guide card number if applicable' {...field} />
                </FormControl>
                <FormDescription>
                  Required for tour guides according to Thai Tourism Business and Guide Act
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
            <h4 className='font-medium text-blue-800 mb-2'>Legal Compliance</h4>
            <p className='text-sm text-blue-700'>
              All activities must comply with the Tourism Business and Guide Act B.E. 2551 (2008) and related regulations.
              Failure to provide valid licenses or maintain required insurance may result in legal penalties.
            </p>
          </div>

          <FormField
            control={form.control}
            name='termsAccepted'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="terms" // Add id for label association
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel htmlFor="terms"> {/* Associate label with checkbox */}
                    I accept the terms and conditions
                  </FormLabel>
                  <FormDescription>
                    By accepting, you agree to comply with all applicable Thai tourism laws and regulations,
                    maintain valid licenses and insurance, and adhere to our platform's terms of service.
                  </FormDescription>
                   <FormMessage /> {/* Display validation message here */}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-4 pt-4'>
          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
          
          <div className='grid grid-cols-2 gap-4'>
             {/* Ensure onClick points to the defined function */}
            <Button 
              type='button' 
              variant='outline' 
              className='w-full' 
              onClick={testDirectSubmission} 
              disabled={isSubmitting} // Disable while submitting
            >
              Test Direct Submission
            </Button>
            
            <Button 
              type='button' 
              variant='secondary' // Changed variant for distinction
              className='w-full' 
              onClick={fillWithTestData}
              disabled={isSubmitting} // Disable while submitting
            >
              Fill Test Data
            </Button>
          </div>
        </div>
        
        {debugInfo && (
          <div className='mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md text-sm border border-slate-200 dark:border-slate-700'>
            <p className='font-mono text-slate-700 dark:text-slate-300'>{debugInfo}</p>
          </div>
        )}
      </form>
    </Form>
  )
}

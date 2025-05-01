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
import { useToast } from '@/hooks/use-toast' // Corrected import path
import activityOwnerService from '@/services/activityOwnerService' // Changed to default import

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  businessType: z.string(),
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
  const { toast } = useToast() // Use the hook correctly
  
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Use the activity owner service to register
      await activityOwnerService.registerActivityOwner({
        business_name: values.businessName,
        owner_name: values.ownerName,
        email: values.email,
        phone: values.phone,
        business_type: values.businessType,
        tax_id: values.taxId,
        address: values.address,
        description: values.description,
        tourism_license_number: values.tourismLicenseNumber,
        tat_license_number: values.tatLicenseNumber,
        guide_card_number: values.guideCardNumber,
        insurance_policy: values.insurancePolicy,
        insurance_amount: values.insuranceAmount,
      })
      
      toast({
        title: 'Registration Successful',
        description: 'Your activity owner account has been created. We will review your information and contact you soon.',
      })
      
      // Reset the form after successful submission
      form.reset()
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Registration Failed',
        description: 'There was an error submitting your registration. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
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
                  <FormLabel>TAT License Number (if applicable)</FormLabel>
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
                  <Input placeholder="+66" {...field} />
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
          <h3 className='text-lg font-medium'>Legal Requirements</h3>
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
                    <Input placeholder='Minimum 1,000,000 THB' {...field} />
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
                <FormLabel>Professional Guide Card Number</FormLabel>
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
              <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>
                    I accept the terms and conditions
                  </FormLabel>
                  <FormDescription>
                    By accepting, you agree to comply with all applicable Thai tourism laws and regulations,
                    maintain valid licenses and insurance, and adhere to our platform's terms of service.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </form>
    </Form>
  )
}
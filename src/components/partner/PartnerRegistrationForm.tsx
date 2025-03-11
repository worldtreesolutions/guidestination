
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

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string(),
  hotelLicenseNumber: z.string().min(1, 'Hotel License number is required'),
  tourismLicenseNumber: z.string().min(1, 'Tourism Business License number is required'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Please enter a complete address'),
  roomCount: z.string().min(1, 'Number of rooms is required'),
  taxId: z.string().min(13, 'Tax ID must be 13 digits'),
  bankName: z.string().min(2, 'Bank name is required'),
  bankAccount: z.string().min(10, 'Bank account number is required'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

export const PartnerRegistrationForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termsAccepted: false,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
    // Handle form submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Thai Legal Requirements</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Hotel License from Ministry of Tourism</li>
              <li>• Tourism Business License</li>
              <li>• Valid Tax ID</li>
              <li>• Business Registration in Thailand</li>
            </ul>
          </div>

          <h3 className="text-lg font-medium">Business Information</h3>
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Hotel or property name" {...field} />
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
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="guesthouse">Guesthouse</SelectItem>
                    <SelectItem value="airbnb">Airbnb Property</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hotelLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="License number from Ministry of Tourism" {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for all accommodation businesses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tourismLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tourism Business License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Tourism Business License number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for tourism-related activities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner/Manager Name</FormLabel>
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

          <FormField
            control={form.control}
            name="roomCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rooms</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Total number of rooms" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input placeholder="13-digit Tax ID number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank name for commission payments" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Account number for receiving payments" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Commission Structure</h4>
            <p className="text-sm text-blue-700">
              Partners receive 15% commission on all activity bookings made through their unique QR code or referral link.
              Commissions are calculated automatically and paid monthly to your registered bank account.
            </p>
          </div>

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I accept the terms and conditions
                  </FormLabel>
                  <FormDescription>
                    By accepting, you agree to comply with all applicable Thai tourism laws and regulations,
                    maintain valid licenses, and adhere to our platform's partnership terms.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Submit Registration
        </Button>
      </form>
    </Form>
  )
}

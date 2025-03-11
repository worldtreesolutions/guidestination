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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check } from "lucide-react"

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
  commissionPackage: z.enum(['basic', 'premium']),
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
          <h3 className="text-lg font-medium">Commission Package Selection</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Basic Package - 10% Commission</CardTitle>
                <CardDescription>
                  Perfect for hotels starting their partnership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Custom QR code for your property
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Roll-up banner for lobby display
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Promotional materials and brochures
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Monthly commission payments
                  </li>
                </ul>
                <FormField
                  control={form.control}
                  name="commissionPackage"
                  render={({ field }) => (
                    <FormItem className="pt-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="basic" id="basic" />
                              <Label htmlFor="basic">Select Basic Package</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="relative border-primary">
              <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                Recommended
              </div>
              <CardHeader>
                <CardTitle>Premium Package - 15% Commission</CardTitle>
                <CardDescription>
                  Maximize your earnings with enhanced promotion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    All Basic Package features
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    QR codes in every room
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    QR codes in elevators and common areas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Integration with welcome emails
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Premium placement in our platform
                  </li>
                </ul>
                <FormField
                  control={form.control}
                  name="commissionPackage"
                  render={({ field }) => (
                    <FormItem className="pt-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="premium" id="premium" />
                              <Label htmlFor="premium">Select Premium Package</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Promotional Materials Included</h4>
            <p className="text-sm text-blue-700 mb-2">
              We provide all necessary promotional materials for both packages:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Professional roll-up banners for lobby display</li>
              <li>• High-quality QR code stickers and displays</li>
              <li>• Digital assets for email marketing</li>
              <li>• Brochures and information cards</li>
            </ul>
          </div>
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
            <p className="text-sm text-blue-700 mb-2">
              Choose between two partnership levels:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Basic Package: 10% commission with lobby promotion</li>
              <li>• Premium Package: 15% commission with full property integration</li>
              <li>• All commissions are automatically calculated and paid monthly</li>
              <li>• Track your earnings in real-time through your partner dashboard</li>
            </ul>
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
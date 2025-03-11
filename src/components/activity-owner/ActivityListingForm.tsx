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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image as ImageIcon } from 'lucide-react'
import { AvailabilityCalendar } from '@/components/activities/AvailabilityCalendar'
import { WeeklyScheduleManager } from '@/components/activities/WeeklyScheduleManager'

const categories = [
  { value: "adventure", label: "Adventure" },
  { value: "nature", label: "Nature" },
  { value: "culture", label: "Culture" },
  { value: "art_craft", label: "Art & Craft" },
  { value: "photography", label: "Photography" },
  { value: "sport", label: "Sport" },
  { value: "cooking", label: "Cooking" }
]

const durations = [
  { value: "1h", label: "1 Hour" },
  { value: "2h", label: "2 Hours" },
  { value: "half_day", label: "Half Day (4 Hours)" },
  { value: "full_day", label: "Full Day (8 Hours)" }
]

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  category: z.string(),
  description: z.string().min(100, "Description must be at least 100 characters"),
  duration: z.string(),
  basePrice: z.string().min(1, "Base price is required"),
  maxParticipants: z.string(),
  includesPickup: z.boolean(),
  pickupLocations: z.string().optional(),
  includesMeal: z.boolean(),
  mealDescription: z.string().optional(),
  highlights: z.string(),
  included: z.string(),
  notIncluded: z.string(),
  meetingPoint: z.string(),
  languages: z.string(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  tripadvisorUrl: z.string().optional(),
  googleBusinessUrl: z.string().optional(),
  calendlyUrl: z.string().min(1, 'Calendly URL is required for managing bookings'),
})

export const ActivityListingForm = () => {
  const [showPickupDetails, setShowPickupDetails] = useState(false)
  const [showMealDetails, setShowMealDetails] = useState(false)
  const [basePrice, setBasePrice] = useState("")
  const [images, setImages] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      includesPickup: false,
      includesMeal: false,
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  const calculateFinalPrice = (basePrice: string) => {
    const price = parseFloat(basePrice) || 0
    const commission = price * 0.2
    return (price + commission).toFixed(2)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Handle image upload logic here
      console.log('Images to upload:', files)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Traditional Thai Cooking Class" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price per Person (THB)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 1000"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        setBasePrice(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Your net price before 20% commission
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="text-sm font-medium">Final Customer Price</label>
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted mt-2">
                ฿{calculateFinalPrice(basePrice)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Price shown to customers (includes 20% commission)
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Participants</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Services Included</h3>
          
          <FormField
            control={form.control}
            name="includesPickup"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      setShowPickupDetails(checked as boolean)
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Includes Hotel Pickup
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {showPickupDetails && (
            <FormField
              control={form.control}
              name="pickupLocations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Locations & Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Specify areas, hotels, or locations where you offer pickup"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="includesMeal"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      setShowMealDetails(checked as boolean)
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Includes Meal
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {showMealDetails && (
            <FormField
              control={form.control}
              name="mealDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the included meals, dietary options, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Activity Details</h3>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide a detailed description of your activity"
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="highlights"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Highlights</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List the main highlights of your activity (one per line)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter each highlight on a new line
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="included"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's Included</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List included items/services (one per line)"
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
              name="notIncluded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's Not Included</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List items/services not included (one per line)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="meetingPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Point</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the meeting point and how to get there"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Languages</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. English, Thai, Chinese" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Photos & Reviews</h3>
          
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Activity Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                {images.map((image, index) => (
                  <div key={index} className='relative aspect-square rounded-lg overflow-hidden bg-muted'>
                    <ImageIcon className='w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
                  </div>
                ))}
                <label className='relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer flex items-center justify-center'>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                    onChange={handleImageUpload}
                  />
                  <div className='text-center'>
                    <Upload className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>Upload Photos</span>
                  </div>
                </label>
              </div>
              <p className='text-sm text-muted-foreground'>
                Upload high-quality photos that showcase your activity. Minimum 1 photo required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Reviews Integration</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='tripadvisorUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TripAdvisor Page URL</FormLabel>
                    <FormControl>
                      <Input placeholder='https://www.tripadvisor.com/your-activity' {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll display your TripAdvisor reviews on your activity page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='googleBusinessUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Business Profile URL</FormLabel>
                    <FormControl>
                      <Input placeholder='https://g.page/your-business' {...field} />
                    </FormControl>
                    <FormDescription>
                      Link your Google Business profile to show Google reviews
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Calendly Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name='calendlyUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Calendly URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='https://calendly.com/your-account' 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Connect your Calendly account to manage bookings and availability
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='mt-4 p-4 bg-muted rounded-lg'>
                <h4 className='font-medium mb-2'>How to set up Calendly:</h4>
                <ol className='list-decimal list-inside space-y-2 text-sm text-muted-foreground'>
                  <li>Create a free Calendly account at calendly.com</li>
                  <li>Set up your availability and booking preferences</li>
                  <li>Copy your Calendly URL and paste it here</li>
                  <li>Customers will be able to book your activity based on your availability</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Manage Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <AvailabilityCalendar 
                onSave={(availability) => {
                  console.log('Saved availability:', availability)
                  // Handle saving availability to backend
                }}
              />
              <div className='mt-4 p-4 bg-muted rounded-lg'>
                <h4 className='font-medium mb-2'>Setting Your Schedule:</h4>
                <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
                  <li>Select dates when your activity is available</li>
                  <li>Add multiple time slots for each date</li>
                  <li>Set maximum participants per time slot</li>
                  <li>Customers will only be able to book available slots</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Manage Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyScheduleManager 
                onSave={(schedule) => {
                  console.log('Saved schedule:', schedule)
                  // Handle saving schedule to backend
                }}
              />
              <div className='mt-4 p-4 bg-muted rounded-lg'>
                <h4 className='font-medium mb-2'>Managing Your Schedule:</h4>
                <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
                  <li>Set your regular weekly schedule</li>
                  <li>Add multiple time slots for each day</li>
                  <li>Easily pause/resume specific days or the entire schedule</li>
                  <li>Define maximum participants per time slot</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button type="submit" className="w-full">
          Submit Activity
        </Button>
      </form>
    </Form>
  )
}
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import activityCrudService, { ActivityInsert } from "@/services/activityCrudService" // Changed import
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash, CalendarIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid } from "date-fns"
import { ImageUploader } from "@/components/dashboard/activities/ImageUploader"
import categoryService, { Category } from '@/services/categoryService'
import { formatCurrency } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { convertDurationStringToHours, toTimestamp } from "@/lib/activityUtils";

// Define the form schema using Zod (ensure it aligns with ActivityInsert)
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").optional().nullable(), // Allow null
  category_id: z.coerce.number().optional().nullable(),
  duration: z.string().min(1, "Please select a duration"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  max_participants: z.coerce.number().min(1, "Maximum participants must be at least 1"),
  has_pickup: z.boolean().default(false), // New field for pickup toggle
  pickup_location: z.string().optional().nullable(), // Made optional
  dropoff_location: z.string().min(5, "Dropoff location is required"),
  meeting_point: z.string().min(5, "Meeting point is required").optional().nullable(), // Allow null
  languages: z.string().optional().nullable(), // Allow null
  highlights: z.string().optional().nullable(), // Allow null
  included: z.string().optional().nullable(), // Allow null
  not_included: z.string().optional().nullable(), // Allow null
  // Change image_url to handle array from ImageUploader, take first URL
  image_urls: z.array(z.string().url()).optional().default([]), // Expect array from uploader
  is_active: z.boolean().default(true),
  b_price: z.coerce.number().optional().nullable(),
  status: z.coerce.number().optional().nullable(),
  discounts: z.coerce.number().optional().nullable(),
  // Schedule fields
  schedule_start_time: z.string().optional().nullable(),
  schedule_end_time: z.string().optional().nullable(),
  schedule_capacity: z.coerce.number().optional().nullable(),
  schedule_availability_start_date: z.string().optional().nullable(),
  schedule_availability_end_date: z.string().optional().nullable(),
})

// Adjust FormValues to match the new schema
type FormValues = z.infer<typeof formSchema>

// Define the React component using a default export
export default function NewActivityPage() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [finalPrice, setFinalPrice] = useState<number>(0)

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please try again.',
          variant: 'destructive'
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Initialize react-hook-form with defaults matching the new schema
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '', // Default to empty string, Zod handles optional/nullable
      category_id: null,
      duration: '2_hours', // Default to 2 hours
      price: 0,
      max_participants: 10,
      has_pickup: false, // Default to false
      pickup_location: '',
      dropoff_location: '',
      meeting_point: '',
      languages: 'English',
      highlights: '',
      included: '',
      not_included: '',
      image_urls: [], // Default to empty array
      is_active: true,
      b_price: null,
      status: 1, // Default to draft
      discounts: 0,
      // Schedule defaults
      schedule_start_time: '09:00',
      schedule_end_time: '11:00',
      schedule_capacity: 10,
      schedule_availability_start_date: new Date().toISOString().split('T')[0],
      schedule_availability_end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    }
  })

  // Watch the has_pickup field to conditionally show pickup location
  const hasPickup = form.watch('has_pickup')
  
  // Watch the duration field to update end time based on start time
  const duration = form.watch('duration')
  const startTime = form.watch('schedule_start_time')

  // Update end time when start time or duration changes
  useEffect(() => {
    if (startTime && duration) {
      const start = new Date(`2000-01-01T${startTime}`);
      let hours = 2; // Default to 2 hours
      
      const numericDuration = convertDurationStringToHours(duration);
      if (numericDuration !== null) {
        hours = numericDuration;
      }
            
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
      const endTimeString = end.toTimeString().substring(0, 5);
      
      form.setValue('schedule_end_time', endTimeString);
    }
  }, [startTime, duration, form]); // Added form to dependency array

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/dashboard/login')
    }
  }, [isAuthenticated, router])

 // Calculate final price whenever price changes
  const priceFormValue = form.watch("price");
  useEffect(() => {
    if (priceFormValue) {
      // Add 20% markup
      const withMarkup = priceFormValue * 1.2
      // Add 7% VAT
      const withVAT = withMarkup * 1.07
      setFinalPrice(withVAT)
    } else {
      setFinalPrice(0)
    }
  }, [priceFormValue]); // Corrected dependency array


  // Handle form submission using activityCrudService
  const onSubmit = async (data: FormValues) => {
    if (!user || !user.id) {
      toast({ title: 'Error', description: 'User not found. Please log in again.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true)

    try {
      // Get provider ID from user metadata
      const providerId = user.app_metadata?.provider_id;
      
      console.log('Provider ID from metadata:', providerId, 'Type:', typeof providerId);

      // Prepare data directly matching ActivityInsert structure
      const activityData: ActivityInsert = {
        // Map form values to ActivityInsert fields
        title: data.title,
        description: data.description,
        category_id: data.category_id ? Number(data.category_id) : null,
        duration: convertDurationStringToHours(data.duration), // Use imported helper
        max_participants: Number(data.max_participants),
        pickup_location: data.has_pickup ? data.pickup_location || '' : '', // Use empty string if no pickup
        dropoff_location: data.dropoff_location,
        meeting_point: data.meeting_point ?? null,
        languages: data.languages,
        highlights: data.highlights,
        included: data.included ?? null,
        not_included: data.not_included ?? null,
        image_url: data.image_urls && data.image_urls.length > 0 ? data.image_urls[0] : null, // Take first URL or null
        is_active: data.is_active,
        b_price: data.b_price ? Number(data.b_price) : undefined,
        final_price: finalPrice,
        status: data.status ? Number(data.status) : null,
        discounts: data.discounts ? Number(data.discounts) : 0,
        // Explicitly set provider_id as a number
        provider_id: providerId,
      };

      console.log('Activity data being sent:', JSON.stringify(activityData));
      console.log('Provider ID in activity data:', activityData.provider_id, 'Type:', typeof activityData.provider_id);

      // Call the CRUD service create function, passing the user object
      const createdActivity = await activityCrudService.createActivity(activityData, user);

      // Create schedule for the activity if activity was created successfully
      if (createdActivity && createdActivity.activity_id) {
        try {
          // Create new schedule
          const { data: scheduleData, error: scheduleError } = await supabase
            .from('activity_schedules')
            .insert({
              activity_id: createdActivity.activity_id, // Use the ID from the created activity
              start_time: toTimestamp(data.schedule_start_time ?? '09:00'), // Use imported helper
              end_time: toTimestamp(data.schedule_end_time ?? '11:00'), // Use imported helper
              capacity: data.schedule_capacity || 10,
              availability_start_date: data.schedule_availability_start_date || undefined,
              availability_end_date: data.schedule_availability_end_date || undefined,
              is_active: true,
              status: 'active',
              created_by: user.id,
              updated_by: user.id,
            })
            .select()
            .single();

          if (scheduleError) {
            console.error('Error creating schedule:', scheduleError);
            toast({
              title: 'Warning',
              description: 'Activity created but schedule could not be saved. You can add schedules later.',
              variant: 'default'
            });
          }
        } catch (scheduleError) {
          console.error('Error creating schedule:', scheduleError);
        }
      }

      toast({
        title: 'Activity Created',
        description: 'Your new activity has been successfully created.'
      });

      router.push('/dashboard/activities');
    } catch (error: any) { // Catch specific error type if possible
      console.error('Error creating activity:', error);
      toast({
        title: 'Error',
        description: `Failed to create activity: ${error.message || 'Please try again.'}`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Render the component
  return (
    <>
      <Head>
        <title>{t("dashboard.activities.createNew") || "Create New Activity - Provider Dashboard"}</title>
        <meta name='description' content={t("dashboard.activities.createDescription") || "Add a new activity to your listings"} />
      </Head>

      <DashboardLayout>
        <div className='space-y-6'>
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>{t("dashboard.activities.createTitle") || "Create New Activity"}</h1>
              <p className='text-muted-foreground'>
                {t("dashboard.activities.createSubtitle") || "Fill in the details to list a new activity."}
              </p>
            </div>
            <Button variant='outline' asChild>
              <Link href='/dashboard/activities'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                {t("dashboard.activities.backToActivities") || "Back to Activities"}
              </Link>
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.activities.basicInfo") || "Basic Information"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.activities.basicInfoDescription") || "Provide the essential details about your activity."}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.activityTitle") || "Activity Title"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("dashboard.activities.titlePlaceholder") || 'e.g. Chiang Mai Old City Temple Tour'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.description") || "Description"}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("dashboard.activities.descriptionPlaceholder") || 'Describe the activity, what makes it unique...'}
                            className='min-h-[120px]'
                            {...field}
                            value={field.value ?? ''} // Handle null value for Textarea
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='category_id'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.category") || "Category"}</FormLabel>
                           {/* Use Select for better UX */}
                           <Select onValueChange={(value) => field.onChange(value ? Number(value) : null)} value={field.value?.toString() ?? ''}>
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder={t("dashboard.activities.categoryPlaceholder") || 'Select a category'} />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {categories.map((category) => (
                                 <SelectItem key={category.id} value={category.id.toString()}>
                                   {category.name}
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
                      name='duration'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.duration") || "Duration"}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("dashboard.activities.durationPlaceholder") || 'Select duration'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='1_hour'>{t("dashboard.activities.duration1Hour") || "1 Hour"}</SelectItem>
                              <SelectItem value='2_hours'>{t("dashboard.activities.duration2Hours") || "2 Hours"}</SelectItem>
                              <SelectItem value='half_day'>{t("dashboard.activities.durationHalfDay") || "Half Day (4 Hours)"}</SelectItem>
                              <SelectItem value='full_day'>{t("dashboard.activities.durationFullDay") || "Full Day (8 Hours)"}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t("dashboard.activities.durationDescription") || "Select the duration of the activity"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.pricePerPerson") || "Price per Person (THB)"}</FormLabel>
                          <FormControl>
                            <Input type='number' min='0' {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("dashboard.activities.priceDescription") || "The price customers will see."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                <FormLabel>{t("dashboard.activities.finalPrice") || "Final Price (with 20% markup + 7% VAT)"}</FormLabel>
                <Input
                  type="text"
                  value={formatCurrency(finalPrice)}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>
                  {t("dashboard.activities.finalPriceDescription") || "Automatically calculated based on price per person"}
                </FormDescription>
              </FormItem>

                    <FormField
                      control={form.control}
                      name='max_participants'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.maxParticipants") || "Maximum Participants"}</FormLabel>
                          <FormControl>
                            <Input type='number' min='1' {...field} />
                          </FormControl>
                           <FormDescription>
                            {t("dashboard.activities.maxParticipantsDescription") || "Maximum group size per session."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.activities.schedule") || "Activity Schedule"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.activities.scheduleDescription") || "Set when this activity is available for booking."}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='schedule_start_time'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.startTime") || "Start Time"}</FormLabel>
                          <FormControl>
                            <Input type='time' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='schedule_end_time'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.endTime") || "End Time"}</FormLabel>
                          <FormControl>
                            <Input type='time' {...field} disabled value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            {t("dashboard.activities.endTimeDescription") || "Auto-calculated based on duration"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='schedule_capacity'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.capacityPerSchedule") || "Capacity per Schedule"}</FormLabel>
                        <FormControl>
                          <Input 
                            type='number' 
                            min='1' 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("dashboard.activities.capacityDescription") || "Maximum number of bookings per scheduled time"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='schedule_availability_start_date'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.availableFrom") || "Available From"}</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='schedule_availability_end_date'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.availableUntil") || "Available Until"}</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.activities.additionalDetails") || "Additional Details"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.activities.additionalDetailsDescription") || "Provide more specific information about the activity."}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Pickup Toggle */}
                  <FormField
                    control={form.control}
                    name='has_pickup'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>{t("dashboard.activities.pickupAvailable") || "Pickup Available"}</FormLabel>
                          <FormDescription>
                            {t("dashboard.activities.pickupDescription") || "Toggle if pickup service is available for this activity"}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Conditional Pickup Location Field */}
                  {hasPickup && (
                    <FormField
                      control={form.control}
                      name='pickup_location'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dashboard.activities.pickupLocation") || "Pickup Location"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("dashboard.activities.pickupLocationPlaceholder") || 'e.g., Your hotel lobby'} {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            {t("dashboard.activities.pickupLocationDescription") || "Where will participants be picked up from?"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name='dropoff_location'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.dropoffLocation") || "Dropoff Location"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("dashboard.activities.dropoffLocationPlaceholder") || 'e.g., Your hotel lobby'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='meeting_point'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.meetingPoint") || "Meeting Point"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("dashboard.activities.meetingPointPlaceholder") || 'e.g., Tha Phae Gate'} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='languages'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.languagesOffered") || "Languages Offered"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("dashboard.activities.languagesPlaceholder") || 'e.g., English, Thai'} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Activity Specifics Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.activities.specifics") || "Activity Specifics"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.activities.specificsDescription") || "Detail the highlights and what's included or excluded."}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='highlights'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.highlights") || "Highlights"}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("dashboard.activities.highlightsPlaceholder") || 'e.g., Scenic views, local culture'} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='included'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.included") || "What's Included"}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("dashboard.activities.includedPlaceholder") || 'e.g., Guide, meals'} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='not_included'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.notIncluded") || "What's Not Included (Optional)"}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("dashboard.activities.notIncludedPlaceholder") || 'e.g., Tips, personal expenses'} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.activities.images") || "Images"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.activities.imagesDescription") || "Upload images showcasing your activity. The first image will be the main cover."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name='image_urls'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.activityImages") || "Activity Images"}</FormLabel>
                        <FormControl>
                          <ImageUploader 
                            value={field.value} 
                            onChange={field.onChange}
                            maxImages={8}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.activities.status") || "Activity Status"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.activities.statusDescription") || "Set the visibility of your activity."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dashboard.activities.statusLabel") || "Status"}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || '1'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("dashboard.activities.statusPlaceholder") || 'Select status'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='1'>{t("dashboard.activities.statusDraft") || "Draft (Hidden)"}</SelectItem>
                            <SelectItem value='2'>{t("dashboard.activities.statusPublished") || "Published (Visible)"}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("dashboard.activities.statusHelpText") || "'Draft' keeps it hidden, 'Published' makes it live."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <CardFooter className='flex justify-end gap-4 pt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/activities')}
                  disabled={isSubmitting}
                >
                  {t("dashboard.activities.cancel") || "Cancel"}
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t("dashboard.activities.creating") || "Creating..."}
                    </>
                  ) : (
                    t("dashboard.activities.createActivity") || "Create Activity"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </div>
      </DashboardLayout>
    </>
  )
}

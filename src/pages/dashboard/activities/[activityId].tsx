import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout" // Updated import path
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
import activityCrudService, { ActivityUpdate, Activity as CrudActivity } from "@/services/activityCrudService" // Changed import
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash, CalendarIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid, parseISO } from "date-fns"
import { ImageUploader } from '@/components/dashboard/activities/ImageUploader'
import categoryService, { Category } from '@/services/categoryService'

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').optional().nullable(),
  category_id: z.coerce.number().optional().nullable(),
  duration: z.string().min(1, 'Please select a duration'),
  final_price: z.coerce.number().min(1, 'Price must be greater than 0'),
  max_participants: z.coerce.number().min(1, 'Maximum participants must be at least 1').optional().nullable(),
  has_pickup: z.boolean().default(false), // Add pickup toggle
  pickup_location: z.string().optional().nullable(), // Make pickup location optional
  dropoff_location: z.string().min(5, 'Dropoff location is required'),
  meeting_point: z.string().min(5, 'Meeting point is required').optional().nullable(),
  languages: z.string().optional().nullable(),
  highlights: z.string().optional().nullable(),
  included: z.string().optional().nullable(),
  not_included: z.string().optional().nullable(),
  image_urls: z.array(z.string().url()).optional().default([]),
  is_active: z.boolean().optional().nullable(),
  b_price: z.coerce.number().optional().nullable(),
  status: z.coerce.number().optional().nullable(),
  discounts: z.coerce.number().optional().nullable(),
  // Schedule fields
  schedule_start_time: z.string().optional().nullable(),
  schedule_end_time: z.string().optional().nullable(),
  schedule_capacity: z.coerce.number().optional().nullable(),
  schedule_availability_start_date: z.string().optional().nullable(),
  schedule_availability_end_date: z.string().optional().nullable(),
  schedule_id: z.coerce.number().optional().nullable(), // For existing schedule
})

type FormValues = z.infer<typeof formSchema>

// Updated interface to match the actual database schema
interface ActivitySchedule {
  id?: number; // Make id optional since it might not be present in all responses
  activity_id: number;
  created_at?: string;
  start_time: string;
  end_time: string;
  capacity: number;
  created_by?: string | null;
  updated_by?: string | null;
  availability_start_date: string | null;
  availability_end_date: string | null;
  is_active: boolean | null;
  status: string | null;
}

// Helper function to convert duration string to hours
const convertDurationStringToHours = (durationString: string | null | undefined): number | null => {
  if (!durationString) return null;
  switch (durationString) {
    case "1_hour": return 1;
    case "2_hours": return 2;
    case "half_day": return 4;
    case "full_day": return 8;
    default:
      const numericDuration = parseInt(durationString, 10);
      return !isNaN(numericDuration) ? numericDuration : null;
  }
};

export default function EditActivityPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { activityId } = router.query
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activity, setActivity] = useState<CrudActivity | null>(null)
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([])
  const [categories, setCategories] = useState<Category[]>([])

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: null,
      duration: '2_hours',
      final_price: 0,
      max_participants: 10,
      has_pickup: false, // Default to false
      pickup_location: '',
      dropoff_location: '',
      meeting_point: '',
      languages: '',
      highlights: '',
      included: '',
      not_included: '',
      image_urls: [],
      is_active: true,
      b_price: null,
      status: null,
      discounts: 0,
      // Schedule defaults
      schedule_start_time: '09:00',
      schedule_end_time: '11:00',
      schedule_capacity: 10,
      schedule_availability_start_date: new Date().toISOString().split('T')[0],
      schedule_availability_end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      schedule_id: null,
    }
  })

  // Watch the has_pickup field to conditionally show pickup location
  const hasPickup = form.watch('has_pickup')
  
  // Watch the duration field to update end time based on start time
  const duration = form.watch('duration')
  const startTime = form.watch('schedule_start_time')

  const toTimestamp = (timeString: string) => {
  const today = new Date();
  const [hours, minutes] = timeString.split(':');
  today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return today.toISOString(); // Format as 'YYYY-MM-DDTHH:mm:ss.sssZ'
};
  // Update end time when start time or duration changes
  useEffect(() => {
    if (startTime && duration) { // Ensure duration is also available
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
  }, [startTime, duration, form]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/dashboard/login')
      return
    }

    const numericActivityId = activityId && typeof activityId === 'string' && /^\d+$/.test(activityId)
      ? parseInt(activityId, 10)
      : null;

    if (numericActivityId) {
      const fetchActivityAndSchedules = async () => {
        setIsLoading(true)
        try {
          // Fetch activity
          const fetchedActivity = await activityCrudService.getActivityById(numericActivityId)
          
          // Fetch schedules for this activity
          const { data: scheduleData, error: scheduleError } = await supabase
            .from('activity_schedules')
            .select('*')
            .eq('activity_id', numericActivityId);
            
          if (scheduleError) {
            console.error('Error fetching schedules:', scheduleError);
          }
          
          const activitySchedules = scheduleData || [];
          setSchedules(activitySchedules as ActivitySchedule[]);
          
          if (fetchedActivity) {
            setActivity(fetchedActivity)
            
            // Convert single image_url to array for image_urls
            // Ensure we're only using string values for image URLs
            const imageUrl = fetchedActivity.image_url;
            const imageUrls: string[] = [];
            
            if (typeof imageUrl === 'string' && imageUrl) {
              imageUrls.push(imageUrl);
            }
            
            // Determine if pickup is available based on pickup_location
            const hasPickup = !!fetchedActivity.pickup_location && fetchedActivity.pickup_location.trim() !== '';
            
            // Get the first schedule if available
            const firstSchedule = activitySchedules.length > 0 ? activitySchedules[0] : null;
            
            // Ensure duration is a string for the form, but it will be converted for saving
            const durationString = typeof fetchedActivity.duration === "number" 
              ? `${fetchedActivity.duration}_hours` // Attempt to reverse map, might need better logic if not direct hours
              : typeof fetchedActivity.duration === "string" 
                ? fetchedActivity.duration
                : "2_hours";

            // A more robust way to map numeric duration back to form string if needed:
            let formDuration = "2_hours";
            if (typeof fetchedActivity.duration === "number") {
                if (fetchedActivity.duration === 1) formDuration = "1_hour";
                else if (fetchedActivity.duration === 2) formDuration = "2_hours";
                else if (fetchedActivity.duration === 4) formDuration = "half_day";
                else if (fetchedActivity.duration === 8) formDuration = "full_day";
                // else keep default or handle other numeric values if they exist
            } else if (typeof fetchedActivity.duration === "string") {
                formDuration = fetchedActivity.duration;
            }
            
            form.reset({
              title: fetchedActivity.title,
              description: fetchedActivity.description ?? '',
              category_id: fetchedActivity.category_id ?? null,
              duration: formDuration, // Use the mapped form duration
              final_price: fetchedActivity.final_price ?? 0,
              max_participants: fetchedActivity.max_participants ?? 10,
              has_pickup: hasPickup, // Set based on pickup_location
              pickup_location: fetchedActivity.pickup_location ?? '',
              dropoff_location: fetchedActivity.dropoff_location ?? '',
              meeting_point: fetchedActivity.meeting_point ?? '',
              languages: fetchedActivity.languages ?? '',
              highlights: fetchedActivity.highlights ?? '',
              included: fetchedActivity.included ?? '',
              not_included: fetchedActivity.not_included ?? '',
              image_urls: imageUrls, // Use our sanitized array of strings
              is_active: fetchedActivity.is_active ?? true,
              b_price: fetchedActivity.b_price ?? null,
              status: fetchedActivity.status ?? null,
              discounts: fetchedActivity.discounts ?? 0,
              // Schedule fields
              schedule_id: firstSchedule?.id ?? null,
              schedule_start_time: firstSchedule?.start_time ?? '09:00',
              schedule_end_time: firstSchedule?.end_time ?? '11:00',
              schedule_capacity: firstSchedule?.capacity ?? 10,
              schedule_availability_start_date: firstSchedule?.availability_start_date ?? new Date().toISOString().split('T')[0],
              schedule_availability_end_date: firstSchedule?.availability_end_date ?? new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            })
          } else {
            toast({ title: 'Error', description: 'Activity not found.', variant: 'destructive' })
            router.push('/dashboard/activities')
          }
        } catch (error: any) {
          console.error('Error fetching activity:', error)
          toast({ title: 'Error', description: `Failed to load activity  ${error.message}`, variant: 'destructive' })
        } finally {
          setIsLoading(false)
        }
      }
      fetchActivityAndSchedules()
    } else if (router.isReady) {
      setIsLoading(false)
      if (!numericActivityId) {
         toast({ title: 'Error', description: 'Invalid activity ID.', variant: 'destructive' })
         router.push('/dashboard/activities')
      }
    }
  }, [activityId, isAuthenticated, router, toast, form])

  const onSubmit = async (data: FormValues) => {
    const numericActivityId = activityId && typeof activityId === 'string' && /^\d+$/.test(activityId)
      ? parseInt(activityId, 10)
      : null;

    if (!user || !numericActivityId) {
        toast({ title: 'Error', description: 'User or Activity ID missing.', variant: 'destructive' });
        return;
    }

    setIsSubmitting(true)

    try {
      // Extract only the activity fields (not schedule fields) for the activity update
      const activityData: Partial<ActivityUpdate> = {
        title: data.title,
        description: data.description,
        category_id: data.category_id ? Number(data.category_id) : null,
        duration: convertDurationStringToHours(data.duration), // Convert duration string to number
        final_price: Number(data.final_price),
        max_participants: data.max_participants ? Number(data.max_participants) : null,
        pickup_location: data.has_pickup ? data.pickup_location || '' : '',
        dropoff_location: data.dropoff_location,
        meeting_point: data.meeting_point,
        languages: data.languages,
        highlights: data.highlights,
        included: data.included,
        not_included: data.not_included,
        image_url: data.image_urls && data.image_urls.length > 0 ? data.image_urls[0] : null,
        is_active: data.is_active,
        b_price: data.b_price ? Number(data.b_price) : null,
        status: data.status !== null && data.status !== undefined ? Number(data.status) as number : null,
        discounts: data.discounts ? Number(data.discounts) : 0,
      };

      // Update activity
      await activityCrudService.updateActivity(numericActivityId, activityData, user);

      // Update or create schedule separately
      const scheduleData = {
        activity_id: numericActivityId,
        start_time: toTimestamp(data.schedule_start_time ?? '09:00'),
        end_time: toTimestamp(data.schedule_end_time ?? '11:00'),
        capacity: data.schedule_capacity || 10,
        availability_start_date: data.schedule_availability_start_date || undefined, // Convert null/empty to undefined
        availability_end_date: data.schedule_availability_end_date || undefined,   // Convert null/empty to undefined
        is_active: true,
        status: 'active' as const, // Ensure status is of literal type 'active' or string | null based on DB
        updated_by: user.id, // Assuming user.id is string (UUID)
      };

      if (data.schedule_id) {
        // Update existing schedule
        const { error } = await supabase
          .from('activity_schedules')
          .update(scheduleData)
          .eq('id', data.schedule_id);

        if (error) {
          console.error('Error updating schedule:', error);
          toast({
            title: 'Warning',
            description: 'Activity updated but schedule could not be saved.',
            variant: 'default'
          });
        }
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('activity_schedules')
          .insert({
            ...scheduleData,
            created_by: user.id, // Assuming user.id is string (UUID)
          });

        if (error) {
          console.error('Error creating schedule:', error);
          toast({
            title: 'Warning',
            description: 'Activity updated but schedule could not be saved.',
            variant: 'default'
          });
        }
      }

      toast({
        title: 'Activity updated',
        description: 'Your activity has been successfully updated.'
      })

      router.push('/dashboard/activities')
    } catch (error: any) {
      console.error('Error updating activity:', error)
      toast({
        title: 'Error',
        description: `Failed to update activity: ${error.message || 'Please try again.'}`,
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-full'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='ml-2'>Loading activity details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!activity) {
     return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-full'>
          <p>Activity not found or could not be loaded.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Activity - {activity?.title || 'Provider Dashboard'}</title>
        <meta name='description' content='Edit details for your activity' />
      </Head>

      <DashboardLayout>
        <div className='space-y-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Edit Activity</h1>
              <p className='text-muted-foreground'>
                Update the details for '{activity?.title}'
              </p>
            </div>
            <Button variant='outline' asChild>
              <Link href='/dashboard/activities'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Activities
              </Link>
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the basic details about your activity
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Title</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. Doi Suthep Temple Tour' {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe your activity in detail...'
                            className='min-h-[120px]'
                            {...field}
                            value={field.value || ''}
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
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value ? Number(value) : null)} 
                            value={field.value?.toString() ?? ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select a category' />
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
                          <FormLabel>Duration</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select duration' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='1_hour'>1 Hour</SelectItem>
                              <SelectItem value='2_hours'>2 Hours</SelectItem>
                              <SelectItem value='half_day'>Half Day (4 Hours)</SelectItem>
                              <SelectItem value='full_day'>Full Day (8 Hours)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the duration of the activity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='final_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Person (THB)</FormLabel>
                          <FormControl>
                            <Input type='number' min='0' {...field} />
                          </FormControl>
                          <FormDescription>
                            Base price before commission
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='max_participants'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Participants</FormLabel>
                          <FormControl>
                            <Input 
                              type='number' 
                              min='1' 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
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
                  <CardTitle>Activity Schedule</CardTitle>
                  <CardDescription>
                    Update when this activity is available for booking.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='schedule_start_time'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type='time' {...field} value={field.value ?? ''} />
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
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type='time' {...field} disabled value={field.value ?? ''} />
                          </FormControl>
                          <FormDescription>
                            Auto-calculated based on duration
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
                        <FormLabel>Capacity per Schedule</FormLabel>
                        <FormControl>
                          <Input 
                            type='number' 
                            min='1' 
                            {...field} 
                            value={field.value ?? ''} // Handle null/undefined
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of bookings per scheduled time
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
                          <FormLabel>Available From</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} value={field.value ?? ''} />
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
                          <FormLabel>Available Until</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} value={field.value ?? ''} />
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
                  <CardTitle>Additional Details</CardTitle>
                  <CardDescription>
                    Update more information about your activity
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
                          <FormLabel className='text-base'>Pickup Available</FormLabel>
                          <FormDescription>
                            Toggle if pickup service is available for this activity
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
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder='e.g., Your hotel lobby' 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Where will participants be picked up from?
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
                        <FormLabel>Dropoff Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. Your hotel lobby'
                            {...field}
                          />
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
                        <FormLabel>Meeting Point</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. Your hotel lobby or Tha Phae Gate'
                            {...field}
                            value={field.value ?? ''} // Handle null/undefined
                          />
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
                        <FormLabel>Languages</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., English, Thai'
                            {...field}
                            value={field.value ?? ''} // Handle null/undefined
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Activity Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Details</CardTitle>
                  <CardDescription>
                    Update highlights and what's included/not included
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='highlights'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highlights</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='e.g., Scenic views, local culture'
                            {...field}
                            value={field.value ?? ''} // Handle null/undefined
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each highlight on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='included'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Included</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='e.g., Guide, meals'
                            {...field}
                            value={field.value ?? ''} // Handle null/undefined
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each included item on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='not_included'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Not Included</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='e.g., Tips, personal expenses'
                            {...field}
                            value={field.value ?? ''} // Handle null/undefined
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each non-included item on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>
                    Update images for your activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name='image_urls'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Images</FormLabel>
                        <FormControl>
                          <ImageUploader 
                            value={field.value} 
                            onChange={field.onChange}
                            maxImages={8}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload images showcasing your activity. The first image will be the main cover.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Status</CardTitle>
                  <CardDescription>
                    Set the visibility of your activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value?.toString() || '1'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='1'>Draft (Hidden)</SelectItem>
                            <SelectItem value='2'>Published (Visible)</SelectItem>
                            <SelectItem value='0'>Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          'Draft' keeps it hidden, 'Published' makes it live.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className='flex justify-end gap-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/activities')}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DashboardLayout>
    </>
  )
}

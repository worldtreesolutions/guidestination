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

// Define the form schema using Zod (ensure it aligns with ActivityInsert)
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category_id: z.coerce.number().optional().nullable(), // Match ActivityInsert
  duration: z.string().min(1, "Please select a duration (e.g., 04:00:00 for 4 hours)"), // Match interval format if needed
  price: z.coerce.number().min(1, "Price must be greater than 0"), // Match 'price' field
  max_participants: z.coerce.number().min(1, "Maximum participants must be at least 1"), // Match 'max_participants'
  pickup_location: z.string().min(5, "Pickup location is required"), // Match 'pickup_location'
  dropoff_location: z.string().min(5, "Dropoff location is required"), // Match 'dropoff_location'
  meeting_point: z.string().min(5, "Meeting point is required"), // Match 'meeting_point'
  languages: z.string().optional().nullable(), // Match 'languages' (assuming comma-separated string or similar)
  highlights: z.string().optional().nullable(), // Match 'highlights' (assuming comma-separated string or similar)
  included: z.string().optional().nullable(), // Match 'included' (assuming comma-separated string or similar)
  not_included: z.string().optional().nullable(), // Match 'not_included'
  image_url: z.string().url("Must be a valid URL").optional().nullable(), // Match 'image_url'
  is_active: z.boolean().default(true), // Match 'is_active'
  b_price: z.coerce.number().optional().nullable(),
  status: z.coerce.number().optional().nullable(), // Assuming status is integer
  discounts: z.coerce.number().optional().nullable(),
})

// Adjust FormValues to match the new schema
type FormValues = z.infer<typeof formSchema>

// Define the React component using a default export
export default function NewActivityPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize react-hook-form with defaults matching the new schema
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: null,
      duration: "04:00:00", // Example interval
      price: 0,
      max_participants: 10,
      pickup_location: "",
      dropoff_location: "",
      meeting_point: "",
      languages: "English",
      highlights: "",
      included: "",
      not_included: "",
      image_url: "",
      is_active: true,
      b_price: null,
      status: 1, // Example status ID
      discounts: 0,
    }
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
    }
  }, [isAuthenticated, router])

  // Handle form submission using activityCrudService
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true)

    try {
      // Prepare data directly matching ActivityInsert structure
      const activityData: ActivityInsert = {
        ...data,
        provider_id: user.app_metadata?.provider_id ?? null, // Get provider_id from user metadata if available
        price: Number(data.price),
        max_participants: Number(data.max_participants),
        category_id: data.category_id ? Number(data.category_id) : null,
        b_price: data.b_price ? Number(data.b_price) : null,
        status: data.status ? Number(data.status) : null,
        discounts: data.discounts ? Number(data.discounts) : 0,
      };

      // Call the CRUD service create function, passing the user object
      await activityCrudService.createActivity(activityData, user);

      toast({
        title: "Activity Created",
        description: "Your new activity has been successfully created."
      })

      router.push("/dashboard/activities")
    } catch (error: any) { // Catch specific error type if possible
      console.error("Error creating activity:", error)
      toast({
        title: "Error",
        description: `Failed to create activity: ${error.message || "Please try again."}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render the component
  return (
    <>
      <Head>
        <title>Create New Activity - Provider Dashboard</title>
        <meta name="description" content="Add a new activity to your listings" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create New Activity</h1>
              <p className="text-muted-foreground">
                Fill in the details to list a new activity.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/activities">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Activities
              </Link>
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details about your activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Chiang Mai Old City Temple Tour" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the activity, what makes it unique..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Adventure</SelectItem>
                              <SelectItem value="2">Culture</SelectItem>
                              <SelectItem value="3">Food & Cuisine</SelectItem>
                              <SelectItem value="4">Nature</SelectItem>
                              <SelectItem value="5">Wellness</SelectItem>
                              <SelectItem value="6">Workshop</SelectItem>
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
                          <FormControl>
                            <Input placeholder="e.g., 04:00:00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Person (THB)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            The price customers will see.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_participants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Participants</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                           <FormDescription>
                            Maximum group size per session.
                          </FormDescription>
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
                    Provide more specific information about the activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pickup_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Your hotel lobby" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dropoff_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dropoff Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Your hotel lobby" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meeting_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Point</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Tha Phae Gate" {...field} />
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
                        <FormLabel>Languages Offered</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., English, Thai" {...field} />
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
                  <CardTitle>Activity Specifics</CardTitle>
                  <CardDescription>
                    Detail the highlights and what's included or excluded.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="highlights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highlights</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Scenic views, local culture" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="included"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Included</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Guide, meals" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="not_included"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Not Included (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Tips, personal expenses" {...field} />
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
                  <CardTitle>Images</CardTitle>
                  <CardDescription>
                    Upload images showcasing your activity. The first image will be the main cover.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="image_url"
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Draft (Hidden)</SelectItem>
                            <SelectItem value="2">Published (Visible)</SelectItem>
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
              <CardFooter className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/activities")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Activity"
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
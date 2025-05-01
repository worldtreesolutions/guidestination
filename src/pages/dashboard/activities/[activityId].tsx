import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout" // Updated import path
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

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").optional().nullable(),
  category_id: z.coerce.number().optional().nullable(),
  duration: z.string().min(1, "Please select a duration (e.g., 04:00:00)"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  max_participants: z.coerce.number().min(1, "Maximum participants must be at least 1").optional().nullable(),
  pickup_location: z.string().min(5, "Pickup location is required"),
  dropoff_location: z.string().min(5, "Dropoff location is required"),
  meeting_point: z.string().min(5, "Meeting point is required").optional().nullable(),
  languages: z.string().optional().nullable(), // Keep as string for simplicity
  highlights: z.string().optional().nullable(), // Keep as string
  included: z.string().optional().nullable(), // Keep as string
  not_included: z.string().optional().nullable(), // Keep as string
  image_url: z.string().url("Must be a valid URL").optional().nullable(), // Single URL
  is_active: z.boolean().optional().nullable(),
  b_price: z.coerce.number().optional().nullable(),
  status: z.coerce.number().optional().nullable(),
  discounts: z.coerce.number().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditActivityPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { activityId } = router.query
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activity, setActivity] = useState<CrudActivity | null>(null) // Use CrudActivity type

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "", // Default to empty string
      category_id: null,
      duration: "",
      price: 0,
      max_participants: 10,
      pickup_location: "",
      dropoff_location: "",
      meeting_point: "",
      languages: "", // Default to empty string
      highlights: "", // Default to empty string
      included: "", // Default to empty string
      not_included: "", // Default to empty string
      image_url: "", // Default to empty string
      is_active: true,
      b_price: null,
      status: null,
      discounts: 0,
    }
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
      return
    }

    const numericActivityId = activityId && typeof activityId === 'string' && /^\d+$/.test(activityId)
      ? parseInt(activityId, 10)
      : null;

    if (numericActivityId) {
      const fetchActivity = async () => {
        setIsLoading(true)
        try {
          const fetchedActivity = await activityCrudService.getActivityById(numericActivityId)
          if (fetchedActivity) {
            setActivity(fetchedActivity)
            form.reset({
              title: fetchedActivity.title,
              description: fetchedActivity.description ?? "",
              category_id: fetchedActivity.category_id ?? null,
              duration: fetchedActivity.duration ?? "",
              price: fetchedActivity.price ?? 0,
              max_participants: fetchedActivity.max_participants ?? 10,
              pickup_location: fetchedActivity.pickup_location ?? "",
              dropoff_location: fetchedActivity.dropoff_location ?? "",
              meeting_point: fetchedActivity.meeting_point ?? "",
              languages: fetchedActivity.languages ?? "", // Use string directly
              highlights: fetchedActivity.highlights ?? "", // Use string directly
              included: fetchedActivity.included ?? "", // Use string directly
              not_included: fetchedActivity.not_included ?? "", // Use string directly
              image_url: fetchedActivity.image_url ?? "", // Use string directly
              is_active: fetchedActivity.is_active ?? true,
              b_price: fetchedActivity.b_price ?? null,
              status: fetchedActivity.status ?? null,
              discounts: fetchedActivity.discounts ?? 0,
            })
          } else {
            toast({ title: "Error", description: "Activity not found.", variant: "destructive" })
            router.push("/dashboard/activities")
          }
        } catch (error: any) {
          console.error("Error fetching activity:", error)
          toast({ title: "Error", description: `Failed to load activity  ${error.message}`, variant: "destructive" })
        } finally {
          setIsLoading(false)
        }
      }
      fetchActivity()
    } else if (router.isReady) {
      setIsLoading(false)
      if (!numericActivityId) {
         toast({ title: "Error", description: "Invalid activity ID.", variant: "destructive" })
         router.push("/dashboard/activities")
      }
    }
  }, [activityId, isAuthenticated, router, toast, form])

  const onSubmit = async (data: FormValues) => {
    const numericActivityId = activityId && typeof activityId === 'string' && /^\d+$/.test(activityId)
      ? parseInt(activityId, 10)
      : null;

    if (!user || !numericActivityId) {
        toast({ title: "Error", description: "User or Activity ID missing.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true)

    try {
      const activityData: ActivityUpdate = {
        ...data,
        price: Number(data.price),
        max_participants: data.max_participants ? Number(data.max_participants) : null,
        category_id: data.category_id ? Number(data.category_id) : null,
        b_price: data.b_price ? Number(data.b_price) : null,
        status: data.status ? Number(data.status) : null,
        discounts: data.discounts ? Number(data.discounts) : 0,
      };

      await activityCrudService.updateActivity(numericActivityId, activityData, user)

      toast({
        title: "Activity updated",
        description: "Your activity has been successfully updated."
      })

      router.push("/dashboard/activities")
    } catch (error: any) {
      console.error("Error updating activity:", error)
      toast({
        title: "Error",
        description: `Failed to update activity: ${error.message || "Please try again."}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading activity details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!activity) {
     return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Activity not found or could not be loaded.</p>
        </div>
      </DashboardLayout>
    )
  }


  return (
    <>
      <Head>
        <title>Edit Activity - {activity?.title || "Provider Dashboard"}</title>
        <meta name="description" content="Edit details for your activity" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Activity</h1>
              <p className="text-muted-foreground">
                Update the details for "{activity?.title}"
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
                    Update the basic details about your activity
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
                          <Input placeholder="e.g. Doi Suthep Temple Tour" {...field} />
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
                            placeholder="Describe your activity in detail..."
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value} // Use value here for controlled component
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="adventure">Adventure</SelectItem>
                              <SelectItem value="culture">Culture</SelectItem>
                              <SelectItem value="food">Food & Cuisine</SelectItem>
                              <SelectItem value="nature">Nature</SelectItem>
                              <SelectItem value="wellness">Wellness</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value} // Use value here
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2_hours">2 Hours</SelectItem>
                              <SelectItem value="half_day">Half Day (4 Hours)</SelectItem>
                              <SelectItem value="full_day">Full Day (8 Hours)</SelectItem>
                              <SelectItem value="multi_day">Multi-Day</SelectItem>
                            </SelectContent>
                          </Select>
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
                            Base price before commission
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
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pickup_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Your hotel lobby"
                              {...field}
                            />
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
                            <Input
                              placeholder="e.g. Your hotel lobby"
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
                    name="meeting_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Point</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Your hotel lobby or Tha Phae Gate"
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
                        <FormLabel>Languages</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {["English", "Thai", "Chinese", "Japanese", "Korean", "French", "German", "Spanish"].map((lang) => (
                              <Button
                                key={lang}
                                type="button"
                                variant={(field.value || []).includes(lang) ? "default" : "outline"} // Safeguard with || []
                                size="sm"
                                onClick={() => {
                                  const currentLangs = field.value || [];
                                  if (currentLangs.includes(lang)) {
                                    field.onChange(currentLangs.filter(l => l !== lang))
                                  } else {
                                    field.onChange([...currentLangs, lang])
                                  }
                                }}
                              >
                                {lang}
                              </Button>
                            ))}
                          </div>
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
                <CardContent className="space-y-6">
                  {/* Highlights */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Highlights</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem("highlights")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Highlight
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.watch("highlights") || []).map((_, index) => ( // Safeguard
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`e.g. Visit the sacred Doi Suthep temple`}
                            {...form.register(`highlights.${index}`)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeListItem("highlights", index)}
                            disabled={(form.watch("highlights") || []).length <= 1} // Safeguard
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.highlights && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.highlights.message}
                      </p>
                    )}
                  </div>

                  {/* Included */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>What's Included</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem("included")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.watch("included") || []).map((_, index) => ( // Safeguard
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`e.g. Hotel pickup and drop-off`}
                            {...form.register(`included.${index}`)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeListItem("included", index)}
                            disabled={(form.watch("included") || []).length <= 1} // Safeguard
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.included && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.included.message}
                      </p>
                    )}
                  </div>

                  {/* Not Included */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>What's Not Included</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem("notIncluded")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.watch("notIncluded") || []).map((_, index) => ( // Safeguard applied
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`e.g. Gratuities`}
                            {...form.register(`notIncluded.${index}`)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeListItem("notIncluded", index)}
                            disabled={(form.watch("notIncluded") || []).length <= 1} // Safeguard applied
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                     {/* Optional: Add error message display for notIncluded if needed */}
                     {form.formState.errors.notIncluded && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {/* Adjust message based on validation rules if any */}
                        {typeof form.formState.errors.notIncluded === 'object' && 'message' in form.formState.errors.notIncluded ? form.formState.errors.notIncluded.message : 'Invalid input'}
                      </p>
                    )}
                  </div>
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
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URLs</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter image URLs (one per line)"
                            value={(field.value || []).join("\n")} // Safeguard
                            onChange={(e) => {
                              const urls = e.target.value.split("\n").filter(url => url.trim() !== "")
                              field.onChange(urls)
                            }}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one image URL per line. You can use images from Unsplash.com
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/activities")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DashboardLayout>
    </>
  )
}
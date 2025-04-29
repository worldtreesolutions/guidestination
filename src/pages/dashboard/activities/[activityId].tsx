
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout" // Corrected import path
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
import { activityService, Activity } from "@/services/activityService"
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
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  duration: z.string().min(1, "Please select a duration"),
  basePrice: z.coerce.number().min(1, "Price must be greater than 0"),
  maxParticipants: z.coerce.number().min(1, "Maximum participants must be at least 1"),
  includesPickup: z.boolean().default(false),
  pickupLocations: z.string().optional(),
  includesMeal: z.boolean().default(false),
  mealDescription: z.string().optional(),
  meetingPoint: z.string().min(5, "Meeting point is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  highlights: z.array(z.string()).min(1, "At least one highlight is required"),
  included: z.array(z.string()).min(1, "At least one included item is required"),
  notIncluded: z.array(z.string()).optional().default([]), // Added default
  images: z.array(z.string()).min(1, "At least one image is required"),
  scheduleDates: z.array(z.date()).optional().default([]), // Added default
  startTime: z.string().optional(),
  endTime: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditActivityPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { activityId } = router.query
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activity, setActivity] = useState<Activity | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      duration: "",
      basePrice: 0,
      maxParticipants: 10,
      includesPickup: false,
      pickupLocations: "",
      includesMeal: false,
      mealDescription: "",
      meetingPoint: "",
      languages: ["English"],
      highlights: [""],
      included: [""],
      notIncluded: [""],
      images: [],
      scheduleDates: [],
      startTime: "09:00",
      endTime: "17:00",
    }
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
      return
    }

    if (activityId && typeof activityId === "string") {
      const fetchActivity = async () => {
        setIsLoading(true)
        try {
          const fetchedActivity = await activityService.getActivityById(activityId)
          if (fetchedActivity) {
            setActivity(fetchedActivity)
            // Populate form with fetched data, ensuring defaults for arrays
            form.reset({
              ...fetchedActivity,
              basePrice: fetchedActivity.basePrice || 0,
              maxParticipants: fetchedActivity.maxParticipants || 10,
              highlights: fetchedActivity.highlights?.length ? fetchedActivity.highlights : [""],
              included: fetchedActivity.included?.length ? fetchedActivity.included : [""],
              notIncluded: fetchedActivity.notIncluded?.length ? fetchedActivity.notIncluded : [""],
              images: fetchedActivity.images?.length ? fetchedActivity.images : [],
              languages: fetchedActivity.languages?.length ? fetchedActivity.languages : ["English"],
              // Handle schedule dates carefully - assuming they are stored as strings
              scheduleDates: fetchedActivity.schedule?.availableDates?.map(dateStr => {
                try {
                  return parseISO(dateStr); // Attempt to parse ISO string
                } catch {
                  return new Date(); // Fallback if parsing fails
                }
              }).filter(isValid) || [], // Filter out invalid dates
              startTime: fetchedActivity.schedule?.startTime || "09:00",
              endTime: fetchedActivity.schedule?.endTime || "17:00",
            })
          } else {
            toast({
              title: "Error",
              description: "Activity not found.",
              variant: "destructive"
            })
            router.push("/dashboard/activities")
          }
        } catch (error) {
          console.error("Error fetching activity:", error)
          toast({
            title: "Error",
            description: "Failed to load activity data. Please try again.",
            variant: "destructive"
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchActivity()
    } else if (router.isReady) {
      // Handle case where activityId is not available yet or invalid
      setIsLoading(false)
      if (!activityId) {
         toast({
            title: "Error",
            description: "Invalid activity ID.",
            variant: "destructive"
          })
         router.push("/dashboard/activities")
      }
    }
  }, [activityId, isAuthenticated, router, toast, form])

  const onSubmit = async ( FormValues) => {
    if (!user || !activityId || typeof activityId !== "string") return

    setIsSubmitting(true)

    try {
      // Prepare data for update, converting dates back to strings if needed
      const activityData: Partial<Activity> = {
        ...data,
        schedule: {
            availableDates: data.scheduleDates?.map(date => date.toISOString()) || [], // Convert dates back to ISO strings
            startTime: data.startTime,
            endTime: data.endTime,
        },
        // Remove scheduleDates from top level if it's handled within schedule object
        // scheduleDates: undefined,
      }
      // Remove scheduleDates if it's part of the schedule object to avoid duplication
      delete (activityData as any).scheduleDates;


      await activityService.updateActivity(activityId, activityData)

      toast({
        title: "Activity updated",
        description: "Your activity has been successfully updated."
      })

      router.push("/dashboard/activities")
    } catch (error) {
      console.error("Error updating activity:", error)
      toast({
        title: "Error",
        description: "Failed to update activity. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Dynamic field arrays
  const addListItem = (field: "highlights" | "included" | "notIncluded") => {
    const currentValues = form.getValues(field) || []
    form.setValue(field, [...currentValues, ""])
  }

  const removeListItem = (field: "highlights" | "included" | "notIncluded", index: number) => {
    const currentValues = form.getValues(field) || []
    if (currentValues.length > 1) {
      form.setValue(
        field,
        currentValues.filter((_, i) => i !== index)
      )
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
                      name="category"
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
                      name="basePrice"
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
                      name="maxParticipants"
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
                      name="includesPickup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Includes Pickup
                            </FormLabel>
                            <FormDescription>
                              Do you offer pickup service?
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

                    <FormField
                      control={form.control}
                      name="includesMeal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Includes Meal
                            </FormLabel>
                            <FormDescription>
                              Is food included in the activity?
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
                  </div>

                  {form.watch("includesPickup") && (
                    <FormField
                      control={form.control}
                      name="pickupLocations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Locations</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. All hotels in Chiang Mai Old City"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("includesMeal") && (
                    <FormField
                      control={form.control}
                      name="mealDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meal Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. Traditional Thai lunch at a local restaurant"
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
                    name="meetingPoint"
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
                    name="images"
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

              {/* Schedule Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>
                    Update available dates and times for your activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="scheduleDates"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Available Dates</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal h-auto py-2"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value && field.value.length > 0 ? (
                                    field.value.length === 1 ? (
                                      isValid(field.value[0]) ? format(field.value[0], 'PP') : "Select dates"
                                    ) : (
                                      `${field.value.length} dates selected`
                                    )
                                  ) : (
                                    <span>Select available dates</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="multiple"
                                selected={field.value}
                                onSelect={field.onChange} // react-hook-form handles the array update
                                initialFocus
                                className="rounded-md border"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Select all dates when this activity will be available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
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

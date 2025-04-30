import { useState, useEffect } from "react" // Add useEffect here
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
import { activityService, Activity } from "@/services/activityService"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash, CalendarIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid } from "date-fns"
import { ImageUploader } from "@/components/dashboard/activities/ImageUploader" // Correctly import ImageUploader

// Define the form schema using Zod
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
  highlights: z.array(z.string().min(1, "Highlight cannot be empty")).min(1, "At least one highlight is required"),
  included: z.array(z.string().min(1, "Included item cannot be empty")).min(1, "At least one included item is required"),
  notIncluded: z.array(z.string().min(1, "Item cannot be empty")).optional().default([]),
  images: z.array(z.string().url("Must be a valid URL")).min(1, "At least one image URL is required"),
  scheduleDates: z.array(z.date()).optional().default([]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"), // Add status field
})

type FormValues = z.infer<typeof formSchema>

// Define the React component using a default export
export default function NewActivityPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize react-hook-form
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
      notIncluded: [],
      images: [],
      scheduleDates: [],
      startTime: "09:00",
      endTime: "17:00",
      status: "draft",
    }
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
    }
  }, [isAuthenticated, router])

  // Handle form submission
  const onSubmit = async ( FormValues) => {
    if (!user) return

    setIsSubmitting(true)

    try {
      const activityData: Omit<Activity, "id" | "finalPrice" | "createdAt" | "updatedAt" | "rating" | "reviewCount"> = {
        ...data,
        providerId: user.id, // Assuming user object has id
        schedule: {
          availableDates: data.scheduleDates?.map(date => date.toISOString()) || [],
          startTime: data.startTime,
          endTime: data.endTime,
        },
        // Ensure optional fields are handled correctly based on boolean flags
        pickupLocations: data.includesPickup ? data.pickupLocations : undefined,
        mealDescription: data.includesMeal ? data.mealDescription : undefined,
        notIncluded: data.notIncluded?.filter(item => item.trim() !== "") || [], // Filter empty strings
      }
      // Remove scheduleDates from top level as it's handled within schedule object
      delete (activityData as any).scheduleDates;
      // Remove status if it's part of the data but not in the Omit list explicitly
      // delete (activityData as any).status; // Keep status if it's part of the creation payload

      // Calculate finalPrice (example: basePrice + 20% commission)
      // This logic might belong in the service or backend ideally
      const finalPrice = data.basePrice * 1.2;
      const creationData = { ...activityData, finalPrice };

      await activityService.createActivity(creationData as Partial<Activity>); // Cast as Partial<Activity> for service

      toast({
        title: "Activity Created",
        description: "Your new activity has been successfully created."
      })

      router.push("/dashboard/activities") // Redirect to activities list after creation
    } catch (error) {
      console.error("Error creating activity:", error)
      toast({
        title: "Error",
        description: "Failed to create activity. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper functions for dynamic list fields
  const addListItem = (field: "highlights" | "included" | "notIncluded") => {
    const currentValues = form.getValues(field) || []
    form.setValue(field, [...currentValues, ""])
  }

  const removeListItem = (field: "highlights" | "included" | "notIncluded", index: number) => {
    const currentValues = form.getValues(field) || []
    if (currentValues.length > 1 || field === "notIncluded") { // Allow removing the last item for 'notIncluded'
       form.setValue(
        field,
        currentValues.filter((_, i) => i !== index)
      )
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            The price customers will see.
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="includesPickup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Includes Pickup</FormLabel>
                            <FormDescription>Is hotel pickup included?</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                            <FormLabel className="text-base">Includes Meal</FormLabel>
                            <FormDescription>Is a meal or snack included?</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                          <FormLabel>Pickup Locations / Details</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Hotels within the Old City, specify meeting point if outside" {...field} />
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
                            <Textarea placeholder="e.g., Traditional Thai lunch set, light snacks and water" {...field} />
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
                          <Input placeholder="e.g., Tha Phae Gate, your hotel lobby (if pickup selected)" {...field} />
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
                           <div className="flex flex-wrap gap-2">
                            {["English", "Thai", "Chinese", "Japanese", "Korean", "French", "German", "Spanish"].map((lang) => (
                              <Button
                                key={lang}
                                type="button"
                                variant={(field.value || []).includes(lang) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const currentLangs = field.value || [];
                                  const updatedLangs = currentLangs.includes(lang)
                                    ? currentLangs.filter(l => l !== lang)
                                    : [...currentLangs, lang];
                                  field.onChange(updatedLangs);
                                }}
                              >
                                {lang}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                         <FormDescription>Select all languages the activity is available in.</FormDescription>
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
                  {/* Highlights */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Highlights</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addListItem("highlights")}>
                        <Plus className="h-4 w-4 mr-1" /> Add Highlight
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.watch("highlights") || []).map((_, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <FormField
                            control={form.control}
                            name={`highlights.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder={`Highlight ${index + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button" variant="outline" size="icon"
                            onClick={() => removeListItem("highlights", index)}
                            disabled={(form.watch("highlights") || []).length <= 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                     {form.formState.errors.highlights?.root && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.highlights.root.message}
                      </p>
                    )}
                  </div>

                   {/* Included */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>What's Included</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addListItem("included")}>
                        <Plus className="h-4 w-4 mr-1" /> Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.watch("included") || []).map((_, index) => (
                         <div key={index} className="flex gap-2 items-center">
                           <FormField
                            control={form.control}
                            name={`included.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder={`Included item ${index + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button" variant="outline" size="icon"
                            onClick={() => removeListItem("included", index)}
                            disabled={(form.watch("included") || []).length <= 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                     {form.formState.errors.included?.root && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.included.root.message}
                      </p>
                    )}
                  </div>

                  {/* Not Included */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>What's Not Included (Optional)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addListItem("notIncluded")}>
                        <Plus className="h-4 w-4 mr-1" /> Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.watch("notIncluded") || []).map((_, index) => (
                         <div key={index} className="flex gap-2 items-center">
                           <FormField
                            control={form.control}
                            name={`notIncluded.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder={`Excluded item ${index + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button" variant="outline" size="icon"
                            onClick={() => removeListItem("notIncluded", index)}
                            // No disabled check needed here, can remove all optional items
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                     {form.formState.errors.notIncluded?.root && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.notIncluded.root.message}
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
                    Upload images showcasing your activity. The first image will be the main cover.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="images"
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

              {/* Schedule Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>
                    Set the available dates and times for your activity.
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
                                  {field.value && field.value.length > 0
                                    ? field.value.length === 1
                                      ? isValid(field.value[0]) ? format(field.value[0], 'PP') : "Select date"
                                      : `${field.value.length} dates selected`
                                    : <span>Select available dates</span>}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="multiple"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="rounded-md border"
                                // Optional: Add disabled dates logic if needed
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Select all dates this activity is offered.
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
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft (Hidden)</SelectItem>
                              <SelectItem value="published">Published (Visible)</SelectItem>
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
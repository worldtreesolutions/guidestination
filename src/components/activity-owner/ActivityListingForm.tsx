
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
import { Card, CardContent } from "@/components/ui/card"

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
})

export const ActivityListingForm = () => {
  const [showPickupDetails, setShowPickupDetails] = useState(false)
  const [showMealDetails, setShowMealDetails] = useState(false)
  const [basePrice, setBasePrice] = useState("")
  
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

        <Button type="submit" className="w-full">
          Submit Activity
        </Button>
      </form>
    </Form>
  )
}


import { useState, useCallback, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { PlacesAutocomplete, PlaceData } from "@/components/ui/places-autocomplete"
import { MapPin } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/integrations/supabase/client"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  address: z.string().min(5, "Please enter a valid address"),
  meetingPoint: z.string().min(5, "Please specify a meeting point"),
  languages: z.string().min(2, "Please specify languages"),
  included: z.string().min(2, "Please specify what's included"),
  notIncluded: z.string().min(2, "Please specify what's not included"),
  highlights: z.string().min(2, "Please specify highlights"),
})

export default function NewActivityPage() {
  const [locationData, setLocationData] = useState<PlaceData | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [finalPrice, setFinalPrice] = useState<string>("0.00")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      address: "",
      meetingPoint: "",
      languages: "",
      included: "",
      notIncluded: "",
      highlights: "",
    },
  })

  const price = form.watch("price")
  useEffect(() => {
    const basePrice = parseFloat(price) || 0
    const withMarkup = basePrice * 1.20 // Add 20% markup
    const withVAT = withMarkup * 1.07 // Add 7% VAT
    setFinalPrice(withVAT.toFixed(2))
  }, [price])

  const handlePlaceSelect = useCallback((placeData: PlaceData) => {
    setLocationData(placeData)
    form.setValue("address", placeData.address, { shouldValidate: true })
  }, [form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (!locationData) {
        toast({
          title: "Location required",
          description: "Please select a valid location from the suggestions",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Upload video if selected
      let videoUrl = null
      let videoDuration = null
      let videoSize = null
      if (selectedVideo) {
        const videoPath = await uploadFile(
          selectedVideo,
          `videos/${Date.now()}-${selectedVideo.name}`
        )
        videoUrl = videoPath
        videoDuration = MAX_VIDEO_DURATION
        videoSize = selectedVideo.size
      }

      // Upload images
      const imageUrls = await Promise.all(
        selectedImages.map((image) =>
          uploadFile(image, `images/${Date.now()}-${image.name}`)
        )
      )

      // Create activity record
      const { data, error } = await supabase.from("activities").insert({
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        final_price: parseFloat(finalPrice),
        address: values.address,
        meeting_point: values.meetingPoint,
        languages: values.languages.split(',').map(lang => lang.trim()),
        included: values.included.split('\n').map(item => item.trim()),
        not_included: values.notIncluded.split('\n').map(item => item.trim()),
        highlights: values.highlights.split('\n').map(item => item.trim()),
        location_lat: locationData.lat,
        location_lng: locationData.lng,
        place_id: locationData.placeId,
        video_url: videoUrl,
        video_duration: videoDuration,
        video_size: videoSize,
        photos: imageUrls,
      }).select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Activity created successfully",
      })

      form.reset()
      setLocationData(null)
      setSelectedVideo(null)
      setSelectedImages([])
    } catch (error) {
      console.error("Error creating activity:", error)
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (THB)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Final Price (with 20% markup + 7% VAT)</FormLabel>
                <Input
                  type="text"
                  value={`${finalPrice} THB`}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>
                  Automatically calculated based on base price
                </FormDescription>
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Location <MapPin className="ml-1 h-4 w-4 text-muted-foreground" />
                  </FormLabel>
                  <FormControl>
                    <PlacesAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      onPlaceSelect={handlePlaceSelect}
                      placeholder="Search for activity location"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  {locationData && (
                    <FormDescription>
                      Location coordinates: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Point</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Specify the meeting point details"
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
                    <Input 
                      placeholder="English, Thai, etc. (comma separated)"
                      {...field}
                    />
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
                    <Textarea 
                      placeholder="List items included (one per line)"
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
                      placeholder="List items not included (one per line)"
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
                      placeholder="List activity highlights (one per line)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <FormLabel>Video (15 seconds max)</FormLabel>
                <Input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="mt-1"
                />
                <FormDescription>
                  Upload a video up to 15 seconds long (MP4 or WebM, max 50MB)
                </FormDescription>
              </div>

              {selectedVideo && (
                <div className="mt-2">
                  <video
                    src={URL.createObjectURL(selectedVideo)}
                    controls
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              <div>
                <FormLabel>Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="mt-1"
                />
                <FormDescription>
                  Upload high-quality images (minimum {MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels)
                </FormDescription>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative aspect-video">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Activity"}
            </Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}

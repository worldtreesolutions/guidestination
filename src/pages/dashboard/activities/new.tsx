
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

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB for video
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"]
const MAX_VIDEO_DURATION = 15 // 15 seconds
const MIN_IMAGE_WIDTH = 1920
const MIN_IMAGE_HEIGHT = 1080

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  address: z.string().min(5, "Please enter a valid address"),
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
    },
  })

  // Calculate final price when price changes
  const watchedPrice = form.watch("price")
  useEffect(() => {
    const price = parseFloat(watchedPrice) || 0
    const withMarkup = price * 1.20 // Add 20% markup
    const withVAT = withMarkup * 1.07 // Add 7% VAT
    setFinalPrice(withVAT.toFixed(2))
  }, [watchedPrice])

  const handlePlaceSelect = useCallback((placeData: PlaceData) => {
    setLocationData(placeData)
    form.setValue("address", placeData.address, { shouldValidate: true })
  }, [form])

  const checkImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = document.createElement("img")
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        resolve(img.width >= MIN_IMAGE_WIDTH && img.height >= MIN_IMAGE_HEIGHT)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4 or WebM video file",
        variant: "destructive",
      })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Video must be less than 50MB",
        variant: "destructive",
      })
      return
    }

    // Check video duration
    const video = document.createElement("video")
    video.preload = "metadata"

    const videoSrc = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(videoSrc)
      if (video.duration > MAX_VIDEO_DURATION) {
        toast({
          title: "Video too long",
          description: "Video must be 15 seconds or shorter",
          variant: "destructive",
        })
        return
      }
      setSelectedVideo(file)
      toast({
        title: "Video selected",
        description: "Video successfully validated and selected",
      })
    }

    video.src = videoSrc
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles: File[] = []
    
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files",
          variant: "destructive",
        })
        continue
      }

      const meetsMinDimensions = await checkImageDimensions(file)
      if (!meetsMinDimensions) {
        toast({
          title: "Image too small",
          description: `Images must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels`,
          variant: "destructive",
        })
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles])
      toast({
        title: "Images selected",
        description: `${validFiles.length} high-quality image(s) successfully validated and selected`,
      })
    }
  }

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

      // Here you would:
      // 1. Upload video and images to storage
      // 2. Get their URLs
      // 3. Create activity record with:
      //    - Base price: values.price
      //    - Final price: finalPrice
      //    - Location: locationData (lat, lng, placeId)
      //    - Media URLs from uploads
      
      toast({
        title: "Success",
        description: "Activity created successfully",
      })
    } catch (error) {
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
  )
}

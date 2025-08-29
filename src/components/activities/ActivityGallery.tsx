import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Camera, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface ActivityGalleryProps {
  images: string[];
  videos: { url: string; thumbnail?: string }[];
  title: string;
}

export function ActivityGallery({ images, videos, title }: ActivityGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const { t } = useLanguage();

  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videos.map(video => ({ type: "video" as const, url: video.url, thumbnail: video.thumbnail }))
  ]

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % allMedia.length)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)
  }

  if (allMedia.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{t('activity.details.noImagesAvailable')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* GetYourGuide Style Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
        {/* Main Large Image */}
        <div className="lg:col-span-3 relative group cursor-pointer">
          <Image
            src={allMedia[0].url}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={() => setIsGalleryOpen(true)}
            priority
          />
          
          {allMedia[0].type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-white/90 rounded-full p-4 shadow-lg">
                <Play className="h-8 w-8 text-gray-800" />
              </div>
            </div>
          )}

          {/* Photo count overlay on main image for mobile */}
          <div className="lg:hidden absolute bottom-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsGalleryOpen(true)}
              className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm border-0"
            >
              <Camera className="h-4 w-4 mr-2" />
              {allMedia.length} photos
            </Button>
          </div>
        </div>

        {/* Right Side Grid - Only on desktop */}
        {allMedia.length > 1 && (
          <div className="hidden lg:grid grid-rows-2 gap-2">
            {/* Top Right Image */}
            {allMedia[1] && (
              <div
                className="relative group cursor-pointer rounded-md overflow-hidden"
                onClick={() => {
                  setSelectedIndex(1)
                  setIsGalleryOpen(true)
                }}
              >
                <Image
                  src={allMedia[1].url}
                  alt={`${title} 2`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {allMedia[1].type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Right - Split into 2 images or show all photos button */}
            <div className="grid grid-cols-2 gap-2">
              {/* Bottom Left Small Image */}
              {allMedia[2] && (
                <div
                  className="relative group cursor-pointer rounded-md overflow-hidden"
                  onClick={() => {
                    setSelectedIndex(2)
                    setIsGalleryOpen(true)
                  }}
                >
                  <Image
                    src={allMedia[2].url}
                    alt={`${title} 3`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {allMedia[2].type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Right Small Image with "Show all photos" overlay */}
              {allMedia[3] ? (
                <div
                  className="relative group cursor-pointer rounded-md overflow-hidden"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  <Image
                    src={allMedia[3].url}
                    alt={`${title} 4`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {allMedia[3].type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* Show all photos overlay */}
                  {allMedia.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-opacity group-hover:bg-black/70">
                      <Camera className="h-6 w-6 mb-1" />
                      <span className="text-sm font-semibold">Show all</span>
                      <span className="text-sm">{allMedia.length} photos</span>
                    </div>
                  )}
                </div>
              ) : (
                /* If only 3 images, show "Show all photos" button */
                allMedia.length === 3 && (
                  <div
                    className="relative group cursor-pointer rounded-md overflow-hidden bg-gray-100 flex flex-col items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    <Camera className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Show all</span>
                    <span className="text-xs">photos</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <div className="relative h-full flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsGalleryOpen(false)}
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 relative">
              {allMedia[selectedIndex].type === "video" ? (
                <video
                  src={allMedia[selectedIndex].url}
                  controls
                  poster={allMedia[selectedIndex].thumbnail}
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={allMedia[selectedIndex].url}
                  alt={`${title} ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                />
              )}

              {allMedia[selectedIndex].type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-4">
                    <Play className="h-12 w-12 text-primary" />
                  </div>
                </div>
              )}

              {allMedia.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="p-4 bg-background border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {allMedia[selectedIndex].type === "video" ? "Video" : "Photo"} {selectedIndex + 1} of {allMedia.length}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{title}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

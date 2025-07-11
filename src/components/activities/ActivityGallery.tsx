import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Camera, X } from "lucide-react"

interface ActivityGalleryProps {
  images: string[]
  videos?: string[]
  title: string
}

export function ActivityGallery({ images, videos = [], title }: ActivityGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videos.map(url => ({ type: "video" as const, url }))
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
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
        <Image
          src={allMedia[0].url}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          onClick={() => setIsGalleryOpen(true)}
        />
        
        {allMedia[0].type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-8 w-8 text-primary" />
            </div>
          </div>
        )}

        {allMedia.length > 1 && (
          <div className="absolute bottom-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsGalleryOpen(true)}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <Camera className="h-4 w-4 mr-2" />
              View all {allMedia.length} photos
            </Button>
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {allMedia.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allMedia.slice(1, 5).map((media, index) => (
            <div
              key={index + 1}
              className="relative aspect-square rounded-md overflow-hidden cursor-pointer group"
              onClick={() => {
                setSelectedIndex(index + 1)
                setIsGalleryOpen(true)
              }}
            >
              <Image
                src={media.url}
                alt={`${title} ${index + 2}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              
              {media.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}

              {index === 3 && allMedia.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">+{allMedia.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
              <Image
                src={allMedia[selectedIndex].url}
                alt={`${title} ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />

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

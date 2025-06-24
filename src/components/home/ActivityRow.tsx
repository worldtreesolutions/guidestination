
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActivityCard } from "./ActivityCard"
import { useRef } from "react"

interface Activity {
  title: string
  image: string
  price: number
  location: string
  rating: number
  href: string
}

interface ActivityRowProps {
  title: string
  activities: Activity[]
  showViewAll?: boolean
  viewAllHref?: string
}

export function ActivityRow({ title, activities, showViewAll = false, viewAllHref }: ActivityRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{title}</h2>
        {showViewAll && viewAllHref && (
          <Button variant="ghost" className="text-sm">
            View All
          </Button>
        )}
      </div>
      
      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-12 w-12"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-12 w-12"
          onClick={scrollRight}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
        
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activities.map((activity, index) => (
            <div key={`${activity.href}-${index}`} className="flex-none w-64 sm:w-72">
              <ActivityCard {...activity} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

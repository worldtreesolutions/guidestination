import { useState } from "react"
import Head from "next/head"
import Image from "next/image"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Share2, Clock, Users, Globe, MapPin } from "lucide-react"
import { ActivityDetails } from "@/components/activities/ActivityDetails"
import { BookingWidget } from "@/components/activities/BookingWidget"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ActivityPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const isMobile = useIsMobile()

  return (
    <>
      <Head>
        <title>Doi Inthanon National Park Eco-Friendly Tour - Guidestination</title>
        <meta name="description" content="Visit Thailand's highest peak and explore the Twin Pagodas and Wachirathan Waterfall on this full-day tour from Chiang Mai." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container py-4 sm:py-8 px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 sm:mb-6">
                  <Image 
                    src="https://images.unsplash.com/photo-1563492065599-3520f775eeed"
                    alt="Doi Inthanon National Park"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">9 hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Small group</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">English guided</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                  Doi Inthanon National Park Eco-Friendly Tour
                </h1>

                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-sm sm:text-base">Chiang Mai, Thailand</span>
                </div>

                <ActivityDetails />
              </div>

              <div className="lg:col-span-1">
                {isMobile ? (
                  <div className="mt-6">
                    <BookingWidget />
                  </div>
                ) : (
                  <div className="sticky top-20">
                    <BookingWidget />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
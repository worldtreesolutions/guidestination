
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

export default function ActivityPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()

  return (
    <>
      <Head>
        <title>Doi Inthanon National Park Eco-Friendly Tour - Guidestination</title>
        <meta name="description" content="Visit Thailand's highest peak and explore the Twin Pagodas and Wachirathan Waterfall on this full-day tour from Chiang Mai." />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                  <Image 
                    src="https://images.unsplash.com/photo-1563492065599-3520f775eeed"
                    alt="Doi Inthanon National Park"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="icon" variant="secondary">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="secondary">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="h-5 w-5" />
                    <span>9 hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-5 w-5" />
                    <span>Small group</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-5 w-5" />
                    <span>English guided</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4">
                  Doi Inthanon National Park Eco-Friendly Tour
                </h1>

                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Chiang Mai, Thailand</span>
                </div>

                <ActivityDetails />
              </div>

              <div className="lg:col-span-1">
                <BookingWidget />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}


import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Star, Clock, Users } from "lucide-react"
import { ActivityCard } from "@/components/home/ActivityCard"
import { establishmentService } from "@/services/establishmentService"
import { referralService } from "@/services/referralService"
import Link from "next/link"
import Image from "next/image"

interface Establishment {
  id: string
  name: string
  type: string
  description?: string
  address?: string
  phone?: string
  email?: string
  location_lat?: number
  location_lng?: number
  place_id?: string
  verification_status: string
}

interface EstablishmentActivity {
  id: string
  activity_id: number
  activity_name: string
  activity_description?: string
  distance_km?: number
  activity_type?: string
  activities?: {
    title: string
    image_url: string
    b_price: number
    description: string
  }
}

export default function EstablishmentProfilePage() {
  const router = useRouter()
  const { establishmentId } = router.query
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [activities, setActivities] = useState<EstablishmentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (establishmentId && typeof establishmentId === 'string') {
      loadEstablishmentData(establishmentId)
      trackVisit(establishmentId)
    }
  }, [establishmentId])

  const loadEstablishmentData = async (id: string) => {
    try {
      setLoading(true)
      const [establishmentData, activitiesData] = await Promise.all([
        establishmentService.getEstablishment(id),
        establishmentService.getEstablishmentActivities(id)
      ])
      
      setEstablishment(establishmentData)
      setActivities(activitiesData)
    } catch (err) {
      console.error('Error loading establishment:', err)
      setError('Failed to load establishment information')
    } finally {
      setLoading(false)
    }
  }

  const trackVisit = async (id: string) => {
    try {
      await referralService.trackVisit(id, {
        page: 'establishment_profile',
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error tracking visit:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading establishment...</p>
        </div>
      </div>
    )
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Establishment Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The establishment you're looking for doesn't exist."}</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{establishment.name} - Guidestination</title>
        <meta name="description" content={establishment.description || `Discover activities near ${establishment.name}`} />
      </Head>

      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{establishment.name}</h1>
                    <Badge variant={establishment.verification_status === 'verified' ? 'default' : 'secondary'}>
                      {establishment.verification_status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="capitalize">{establishment.type}</span>
                    {establishment.address && (
                      <>
                        <span>•</span>
                        <span>{establishment.address}</span>
                      </>
                    )}
                  </div>

                  {establishment.description && (
                    <p className="text-gray-700 mb-6">{establishment.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4">
                    {establishment.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{establishment.phone}</span>
                      </div>
                    )}
                    {establishment.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{establishment.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:w-80">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available Activities</span>
                        <span className="font-semibold">{activities.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Establishment Type</span>
                        <span className="font-semibold capitalize">{establishment.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={establishment.verification_status === 'verified' ? 'default' : 'secondary'}>
                          {establishment.verification_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Activities</h2>
                <p className="text-gray-600">
                  Book these activities through {establishment.name} and help support local businesses
                </p>
              </div>

              {activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.map((activity) => (
                    <div key={activity.id}>
                      {activity.activities ? (
                        <ActivityCard
                          title={activity.activities.title}
                          image={activity.activities.image_url || "/placeholder-activity.jpg"}
                          price={activity.activities.b_price}
                          location={establishment.address || establishment.name}
                          rating={4.5}
                          href={`/activities/${activity.activity_id}?ref=${establishment.id}`}
                        />
                      ) : (
                        <Card className="h-full">
                          <CardHeader>
                            <CardTitle className="text-lg">{activity.activity_name}</CardTitle>
                            {activity.distance_km && (
                              <CardDescription>
                                {activity.distance_km}km from {establishment.name}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4">
                              {activity.activity_description || "Activity details coming soon"}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{activity.activity_type}</Badge>
                              <Link href={`/activities/${activity.activity_id}?ref=${establishment.id}`}>
                                <Button size="sm">View Details</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Available</h3>
                    <p className="text-gray-600">
                      This establishment doesn't have any activities listed yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}

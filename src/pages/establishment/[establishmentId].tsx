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
import { supabase } from "@/integrations/supabase/client"

interface Establishment {
  id: string
  name: string
  address: string
  created_at: string
  updated_at: string
  type?: string
  description?: string
  phone?: string
  email?: string
  location_lat?: number
  location_lng?: number
  place_id?: string
  verification_status?: string
}

interface EstablishmentActivity {
  id: string
  establishment_id: string
  activity_id: number
  title?: string
  description?: string
  price?: number
  location?: string
  image_urls?: string[]
  rating?: number
  review_count?: number
  duration?: number
  max_participants?: number
  category_name?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
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
      
      // Fetch establishment data
      const { data: establishmentData, error: establishmentError } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", id)
        .single()

      if (establishmentError || !establishmentData) {
        throw new Error("Establishment not found")
      }

      // Fetch activities data
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("establishment_activities")
        .select(`
          establishment_id,
          activity_id,
          activities (
            id,
            title,
            description,
            price,
            location,
            image_urls,
            rating,
            review_count,
            duration,
            max_participants,
            is_active
          )
        `)
        .eq("establishment_id", id)

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError)
      }

      // Map the database fields to our interface
      const mappedEstablishment: Establishment = {
        id: establishmentData.id,
        name: establishmentData.name || 'Unknown',
        address: establishmentData.address || '',
        created_at: establishmentData.created_at,
        updated_at: establishmentData.updated_at,
        type: 'establishment',
        description: `Establishment located at ${establishmentData.address}`,
        verification_status: 'pending'
      }

      // Map activities data
      const mappedActivities: EstablishmentActivity[] = activitiesData?.map(item => ({
        id: item.activity_id.toString(),
        establishment_id: item.establishment_id,
        activity_id: item.activity_id,
        title: item.activities?.title || "Activity",
        description: item.activities?.description || "",
        price: item.activities?.price || 0,
        location: item.activities?.location || "Location TBD",
        image_urls: item.activities?.image_urls || [],
        rating: item.activities?.rating || 0,
        review_count: item.activities?.review_count || 0,
        duration: item.activities?.duration || 2,
        max_participants: item.activities?.max_participants || 10,
        is_active: item.activities?.is_active || true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || []
      
      setEstablishment(mappedEstablishment)
      setActivities(mappedActivities)
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
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold">{establishment.name}</h1>
                    <p className="text-muted-foreground">{establishment.address}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Partner since {new Date(establishment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="capitalize">{establishment.type || 'establishment'}</span>
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
                        <span className="font-semibold capitalize">{establishment.type || 'establishment'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={establishment.verification_status === 'verified' ? 'default' : 'secondary'}>
                          {establishment.verification_status || 'pending'}
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
                  {activities.map((activity) => {
                    const mockSupabaseActivity = {
                      id: activity.activity_id,
                      title: activity.title || "Activity",
                      description: activity.description || "",
                      price: activity.price || 0,
                      location: activity.location || "Location TBD",
                      image_urls: activity.image_urls || [],
                      category_id: 1,
                      owner_id: "mock_owner",
                      created_at: activity.created_at || new Date().toISOString(),
                      updated_at: activity.updated_at || new Date().toISOString(),
                      is_active: activity.is_active || true,
                      duration: activity.duration || 2,
                      booking_type: "daily" as const,
                      max_participants: activity.max_participants || 10,
                      rating: activity.rating || 0,
                      review_count: activity.review_count || 0,
                      languages: ["English"],
                      highlights: ["Great experience"],
                      meeting_point: "TBD",
                      included: ["Guide"],
                      not_included: ["Transport"],
                      category_name: activity.category_name || "Activity"
                    };
                    
                    return (
                      <ActivityCard
                        key={activity.id}
                        activity={mockSupabaseActivity}
                      />
                    );
                  })}
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

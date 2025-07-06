import { useState } from "react"
import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PreferencesForm, PreferencesFormData } from "@/components/recommendation/PreferencesForm"
import { recommendActivities, RecommendedPlan } from "@/services/recommendationService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { usePlanning } from "@/contexts/PlanningContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"; // Corrected import

const parseDuration = (duration: string): number => {
  const hours = parseInt(duration.replace("h", ""))
  return isNaN(hours) ? 2 : hours
}

const mockActivities = [
  {
    id: "1",
    title: "Elephant Sanctuary Visit",
    imageUrl: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxlcGhhbnQlMjBzYW5jdHVhcnl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    price: 1500,
    duration: 4, // hours
    day: "Monday",
    hour: 9, // 9 AM
    participants: 2,
    image_url: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxlcGhhbnQlMjBzYW5jdHVhcnl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60", // Added
    b_price: 1500, // Added
  },
  {
    id: "2",
    title: "Thai Cooking Class",
    imageUrl: "https://images.unsplash.com/photo-1556909172-6ab63f18fd12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGhhaSUyMGNvb2tpbmclMjBjbGFzc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    price: 1200,
    duration: 3, // hours
    day: "Tuesday",
    hour: 14, // 2 PM
    participants: 2,
    image_url: "https://images.unsplash.com/photo-1556909172-6ab63f18fd12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGhhaSUyMGNvb2tpbmclMjBjbGFzc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60", // Added
    b_price: 1200, // Added
  },
  {
    id: "3",
    title: "Doi Suthep Temple Tour",
    imageUrl: "https://images.unsplash.com/photo-1583250005041-8208a03d1399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9pJTIwc3V0aGVwJTIwdGVtcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    price: 800,
    duration: 3, // hours
    day: "Wednesday",
    hour: 10, // 10 AM
    participants: 2,
    image_url: "https://images.unsplash.com/photo-1583250005041-8208a03d1399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9pJTIwc3V0aGVwJTIwdGVtcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60", // Added
    b_price: 800, // Added
  },
];

export default function RecommendationPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: 1000,
    duration: 4,
    groupSize: 2,
    interests: [],
    location: "",
    travelDates: {
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })
  const [recommendations, setRecommendations] = useState<SupabaseActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { addActivity } = usePlanning()

  const handlePreferencesSubmit = async (newPreferences: UserPreferences) => {
    setPreferences(newPreferences)
    setLoading(true)
    
    try {
      const results = await recommendationService.getRecommendations(newPreferences)
      setRecommendations(results)
      setShowResults(true)
    } catch (error) {
      console.error("Error getting recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivitySelect = (activity: SupabaseActivity) => {
    addActivity({
      ...activity,
      id: activity.id || 0,
    })
  }

  const handleBackToForm = () => {
    setShowResults(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Finding perfect activities for you...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Your Recommendations - Guidestination</title>
          <meta name="description" content="Personalized activity recommendations based on your preferences" />
        </Head>
        
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={handleBackToForm}
              className="mb-4"
            >
              ← Back to Preferences
            </Button>
            <h1 className="text-3xl font-bold mb-2">Your Personalized Recommendations</h1>
            <p className="text-muted-foreground">
              Based on your preferences, we found {recommendations.length} perfect activities for you
            </p>
          </div>

          {recommendations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No recommendations found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your preferences to find more activities
                </p>
                <Button onClick={handleBackToForm}>
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((activity) => (
                <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <Image
                      src={activity.image_urls?.[0] || "/placeholder.jpg"}
                      alt={activity.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-black">
                        ฿{activity.price?.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{activity.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Max {activity.max_participants || 10}</span>
                      </div>
                      {activity.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{activity.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleActivitySelect({
                          ...activity,
                          id: activity.id,
                        })}
                      >
                        Add to Plan
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/activities/${activity.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Personalized Recommendations - Guidestination</title>
        <meta name="description" content="Get personalized activity recommendations for your stay in Chiang Mai" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
              Personalized Planning
            </h1>

            {!recommendations && !loading && (
              <div className="space-y-6">
                <p className="text-center text-base sm:text-lg mb-6 sm:mb-8">
                  Share your preferences to get a customized schedule
                </p>
                <PreferencesForm onSubmit={handleSubmit} />
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mb-4" />
                <p className="text-base sm:text-lg">Creating your personalized schedule...</p>
              </div>
            )}

            {recommendations && (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Your Recommended Plan
                  </h2>
                  <Button onClick={handleAddAllToPlanning}>
                    Add All to Planning
                  </Button>
                </div>

                <div className="grid gap-4 sm:gap-6">
                  {recommendations.activities.map((activity) => (
                    <Card key={activity.id}>
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-64 h-48">
                          <Image
                            src={activity.image}
                            alt={activity.title}
                            fill
                            className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                          />
                        </div>
                        <CardContent className="flex-1 p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4 mb-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{activity.title}</h3>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                              <p className="font-semibold">{activity.price.toLocaleString()} THB</p>
                              <p className="text-sm text-muted-foreground">{activity.duration}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1">
                              <p className="text-sm">{activity.day}</p>
                              <p className="text-sm text-muted-foreground">{activity.timeSlot}</p>
                            </div>
                            <Button
                              className="w-full sm:w-auto"
                              onClick={() => addActivity({
                                activity_id: activity.id, // Map id to activity_id
                                title: activity.title,
                                image_url: activity.image, // Map image to image_url
                                b_price: activity.price,   // Map price to b_price
                                duration: parseDuration(activity.duration), // Ensure duration is number
                                // Add other necessary fields for PartialActivity
                                name: activity.title, // Assuming name is required or useful
                                // Default other fields as in PlanningContext
                                day: activity.day, // If these are part of PartialActivity
                                hour: 0,           // If these are part of PartialActivity
                                participants: 1    // If these are part of PartialActivity
                              })}
                            >
                              Add to Planning
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>Number of days: {recommendations.numberOfDays}</p>
                      <p>Total budget: {recommendations.totalPrice.toLocaleString()} THB</p>
                      <p>Number of activities: {recommendations.activities.length}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setRecommendations(null)}
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}

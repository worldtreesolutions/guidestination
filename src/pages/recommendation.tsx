
import { useState } from "react"
import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PreferencesForm, PreferencesFormData } from "@/components/recommendation/PreferencesForm"
import { recommendActivities, RecommendedPlan, RecommendedActivity } from "@/services/recommendationService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePlanning } from "@/contexts/PlanningContext"

interface PlanningActivity {
  id: string
  title: string
  image: string
  price: number
  duration: string
  timeSlot: string
  day: string
}

export default function RecommendationPage() {
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendedPlan | null>(null)
  const { addActivity } = usePlanning()

  const handleSubmit = async (data: PreferencesFormData) => {
    setLoading(true)
    try {
      const result = await recommendActivities(data)
      setRecommendations(result)
    } catch (error) {
      console.error("Error getting recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAllToPlanning = () => {
    if (recommendations) {
      recommendations.activities.forEach((activity: RecommendedActivity) => {
        const planningActivity: PlanningActivity = {
          id: activity.id,
          title: activity.title,
          image: activity.image,
          price: activity.price,
          duration: activity.duration,
          timeSlot: activity.timeSlot,
          day: activity.day
        }
        addActivity(planningActivity)
      })
    }
  }

  return (
    <>
      <Head>
        <title>Recommandations Personnalisées - Guidestination</title>
        <meta name="description" content="Obtenez des recommandations d'activités personnalisées pour votre séjour à Chiang Mai" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-center mb-8">
              Planification Personnalisée
            </h1>

            {!recommendations && !loading && (
              <div className="space-y-6">
                <p className="text-center text-lg mb-8">
                  Partagez vos préférences pour obtenir un planning sur mesure
                </p>
                <PreferencesForm onSubmit={handleSubmit} />
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-lg">Création de votre planning personnalisé...</p>
              </div>
            )}

            {recommendations && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">
                    Votre Planning Recommandé
                  </h2>
                  <Button onClick={handleAddAllToPlanning}>
                    Ajouter tout au planning
                  </Button>
                </div>

                <div className="grid gap-6">
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
                        <CardContent className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                              <p className="text-muted-foreground">{activity.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{activity.price.toLocaleString()} THB</p>
                              <p className="text-sm text-muted-foreground">{activity.duration}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <p className="text-sm">{activity.day}</p>
                              <p className="text-sm text-muted-foreground">{activity.timeSlot}</p>
                            </div>
                            <Button
                              onClick={() => addActivity({
                                id: activity.id,
                                title: activity.title,
                                image: activity.image,
                                price: activity.price,
                                duration: activity.duration,
                                timeSlot: activity.timeSlot,
                                day: activity.day
                              })}
                            >
                              Ajouter au planning
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Résumé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>Nombre de jours : {recommendations.numberOfDays}</p>
                      <p>Budget total : {recommendations.totalPrice.toLocaleString()} THB</p>
                      <p>Nombre d'activités : {recommendations.activities.length}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setRecommendations(null)}
                  >
                    Recommencer
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

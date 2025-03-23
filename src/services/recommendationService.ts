
import { PreferencesFormData } from "@/components/recommendation/PreferencesForm"

export interface RecommendedActivity {
  id: string
  title: string
  description: string
  price: number
  duration: string
  category: string
  image: string
  rating: number
  timeSlot: string
  day: string
}

export interface RecommendedPlan {
  activities: RecommendedActivity[]
  totalPrice: number
  numberOfDays: number
}

export const recommendActivities = async (preferences: PreferencesFormData): Promise<RecommendedPlan> => {
  // Simulation de l'appel à l'API d'IA
  const availableDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    .filter(day => !preferences.unavailableDays.includes(day))

  const activitiesPerDay = preferences.travelStyle === "relaxed" ? 2 
    : preferences.travelStyle === "balanced" ? 3 
    : 4

  const budgetPerActivity = preferences.budget === "low" ? 800
    : preferences.budget === "medium" ? 2000
    : 4000

  const sampleActivities: RecommendedActivity[] = [
    {
      id: "1",
      title: "Visite du Temple Doi Suthep",
      description: "Découvrez l'un des temples les plus sacrés de Thaïlande",
      price: 1500,
      duration: "3h",
      category: "Culture & Histoire",
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed",
      rating: 4.8,
      timeSlot: "Matinée (8h-12h)",
      day: availableDays[0]
    },
    {
      id: "2",
      title: "Cours de Cuisine Thaïe",
      description: "Apprenez à cuisiner des plats traditionnels thaïlandais",
      price: 1800,
      duration: "4h",
      category: "Gastronomie",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947",
      rating: 4.9,
      timeSlot: "Après-midi (12h-17h)",
      day: availableDays[0]
    },
    {
      id: "3",
      title: "Sanctuaire des Éléphants",
      description: "Rencontrez des éléphants dans leur habitat naturel",
      price: 2500,
      duration: "6h",
      category: "Nature & Aventure",
      image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5",
      rating: 5.0,
      timeSlot: "Matinée (8h-12h)",
      day: availableDays[1]
    }
  ]

  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    activities: sampleActivities,
    totalPrice: sampleActivities.reduce((sum, act) => sum + act.price, 0),
    numberOfDays: availableDays.length
  }
}

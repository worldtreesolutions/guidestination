import Head from "next/head"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { Calendar } from "lucide-react"
import { usePlanning } from "@/contexts/PlanningContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { FloatingActionButtons } from "@/components/layout/FloatingActionButtons"
import { useState, useEffect } from "react"
import { Activity } from "@/types/activity"
import { activityService } from "@/services/activityService"
import categoryService from "@/services/categoryService"

export default function HomePage() {
  const { selectedActivities } = usePlanning()
  const { t } = useLanguage()
  const [activities, setActivities] = useState<Activity[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesData, categoriesResponse] = await Promise.all([
          activityService.getActivities(),
          categoryService.getAllCategories()
        ])
        setActivities(activitiesData)
        setCategories(categoriesResponse.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getActivitiesByCategory = (categoryId: number) => {
    return activities
      .filter(activity => activity.category_id === categoryId)
      .slice(0, 10)
      .map(activity => ({
        title: activity.title,
        image: typeof activity.image_url === "string" ? activity.image_url : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        price: activity.final_price || activity.b_price || 0,
        location: "Location not specified",
        rating: 4.5,
        href: `/activities/${activity.activity_id}`
      }))
  }

  const getRecommendedActivities = () => {
    return activities
      .slice(0, 10)
      .map(activity => ({
        title: activity.title,
        image: typeof activity.image_url === "string" ? activity.image_url : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        price: activity.final_price || activity.b_price || 0,
        location: "Location not specified",
        rating: 4.5,
        href: `/activities/${activity.activity_id}`
      }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("home.hero.title")}
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t("home.hero.subtitle")}
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Recommended Activities */}
          <ActivityRow
            title="Recommended by Us"
            activities={getRecommendedActivities()}
            showViewAll={true}
            viewAllHref="/activities"
          />

          {/* Category-based Activity Rows */}
          {categories.map((category) => {
            const categoryActivities = getActivitiesByCategory(category.id)
            if (categoryActivities.length === 0) return null

            return (
              <ActivityRow
                key={category.id}
                title={category.name}
                activities={categoryActivities}
                showViewAll={true}
                viewAllHref={`/activities?category=${category.id}`}
              />
            )
          })}
        </div>
      </section>

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  )
}


import Head from "next/head"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { CategorySection } from "@/components/home/CategorySection"
import { BottomActionButtons } from "@/components/layout/BottomActionButtons"
import { FloatingCart } from "@/components/layout/FloatingCart"
import supabaseActivityService, { ActivityForHomepage } from "@/services/supabaseActivityService"

const mockCategories = [
  { id: 1, name: "Adventure" },
  { id: 2, name: "Culture" },
  { id: 3, name: "Food & Cuisine" },
  { id: 4, name: "Nature" },
  { id: 5, name: "Landmarks" },
  { id: 6, name: "Wellness" },
  { id: 7, name: "Workshop" }
]

export default function HomePage() {
  const [featuredActivities, setFeaturedActivities] = useState<ActivityForHomepage[]>([])
  const [recommendedActivities, setRecommendedActivities] = useState<ActivityForHomepage[]>([])
  const [categoryActivities, setCategoryActivities] = useState<{ [key: string]: ActivityForHomepage[] }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        
        // Fetch featured and recommended activities
        const [featured, recommended] = await Promise.all([
          supabaseActivityService.getFeaturedActivities(4),
          supabaseActivityService.getRecommendedActivities(8)
        ])
        
        setFeaturedActivities(featured)
        setRecommendedActivities(recommended)

        // Fetch activities by category
        const categoryData: { [key: string]: ActivityForHomepage[] } = {}
        
        for (const category of mockCategories) {
          try {
            const activities = await supabaseActivityService.getActivitiesByCategory(category.name)
            categoryData[category.name] = supabaseActivityService.convertToHomepageFormat(activities.slice(0, 4))
          } catch (error) {
            console.error(`Error fetching ${category.name} activities:`, error)
            categoryData[category.name] = []
          }
        }
        
        setCategoryActivities(categoryData)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <>
        <Head>
          <title>Guidestination - Discover Amazing Activities</title>
          <meta name="description" content="Discover and book amazing activities and experiences" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Navbar />
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading amazing activities...</p>
          </div>
        </div>

        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Guidestination - Discover Amazing Activities</title>
        <meta name="description" content="Discover and book amazing activities and experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Search Section - Replaced Hero */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <SearchBar />
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <CategorySection categories={mockCategories} />
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Recommended Activities */}
            {recommendedActivities.length > 0 && (
              <ActivityRow
                title="Recommended by Us"
                activities={recommendedActivities}
              />
            )}

            {/* Featured Activities */}
            {featuredActivities.length > 0 && (
              <ActivityRow
                title="Featured Activities"
                activities={featuredActivities}
              />
            )}

            {/* Category-based Activity Rows */}
            {mockCategories.map((category) => {
              const activities = categoryActivities[category.name] || []
              if (activities.length === 0) return null
              
              return (
                <ActivityRow
                  key={category.id}
                  title={category.name}
                  activities={activities}
                />
              )
            })}
          </div>
        </section>

        {/* Bottom Action Buttons */}
        <BottomActionButtons />
        
        {/* Floating Cart */}
        <FloatingCart />
      </div>

      <Footer />
    </>
  )
}

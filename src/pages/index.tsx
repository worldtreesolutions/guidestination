import Head from "next/head"
import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CategoryNav } from "@/components/home/CategoryNav"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { BottomActionButtons } from "@/components/layout/BottomActionButtons"
import { FloatingCart } from "@/components/layout/FloatingCart"
import { supabaseActivityService } from "@/services/supabaseActivityService"
import { ActivityForHomepage } from "@/types/activity"
import categoryService, { type Category } from "@/services/categoryService"

export default function HomePage() {
  const [activitiesByCategory, setActivitiesByCategory] = useState<Record<string, ActivityForHomepage[]>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const fetchAllCategoriesWithActivities = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch categories first
      const fetchedCategories = await categoryService.getAllCategories()
      setCategories(fetchedCategories)

      // Fetch activities for each category
      const categoryActivities: Record<string, ActivityForHomepage[]> = {}
      
      // Add featured activities
      try {
        const featured = await supabaseActivityService.getFeaturedActivities(8)
        categoryActivities["Featured"] = supabaseActivityService.convertToHomepageFormat(featured)
      } catch (error) {
        console.error("Error fetching featured activities:", error)
        categoryActivities["Featured"] = []
      }

      // Add recommended activities
      try {
        const recommended = await supabaseActivityService.getRecommendedActivities(8)
        categoryActivities["Recommended"] = supabaseActivityService.convertToHomepageFormat(recommended)
      } catch (error) {
        console.error("Error fetching recommended activities:", error)
        categoryActivities["Recommended"] = []
      }

      // Fetch activities for each category
      for (const category of fetchedCategories) {
        if (category.name) {
          try {
            const activities = await supabaseActivityService.getActivitiesByCategory(category.name, 8)
            const homepageActivities = supabaseActivityService.convertToHomepageFormat(activities)
            if (homepageActivities.length > 0) {
              categoryActivities[category.name] = homepageActivities
            }
          } catch (error) {
            console.error(`Error fetching activities for category ${category.name}:`, error)
          }
        }
      }

      setActivitiesByCategory(categoryActivities)
    } catch (error) {
      console.error("Error fetching categories and activities:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllCategoriesWithActivities()
  }, [fetchAllCategoriesWithActivities])

  const handleSelectCategory = useCallback((categoryName: string | null) => {
    setSelectedCategory(categoryName)
  }, [])

  const renderActivityRows = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      )
    }

    if (selectedCategory) {
      const activities = activitiesByCategory[selectedCategory] || []
      return (
        <div className="space-y-8">
          <ActivityRow title={selectedCategory} activities={activities} />
        </div>
      )
    }

    // Netflix-style: Show all categories with their activities
    return (
      <div className="space-y-12">
        {Object.entries(activitiesByCategory).map(([categoryName, activities]) => {
          if (activities.length === 0) return null
          
          return (
            <ActivityRow
              key={categoryName}
              title={categoryName}
              activities={activities}
            />
          )
        })}
      </div>
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
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <SearchBar />
          </div>
        </section>

        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <CategoryNav 
              categories={categories}
              selectedCategory={selectedCategory} 
              onSelectCategory={handleSelectCategory} 
            />
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {renderActivityRows()}
          </div>
        </section>

        <BottomActionButtons />
        <FloatingCart />
      </div>

      <Footer />
    </>
  )
}

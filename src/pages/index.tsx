import Head from "next/head"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CategoryNav } from "@/components/home/CategoryNav"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { BottomActionButtons } from "@/components/layout/BottomActionButtons"
import { FloatingCart } from "@/components/layout/FloatingCart"
import { supabaseActivityService } from "@/services/supabaseActivityService"
import { ActivityForHomepage } from "@/types/activity"

export default function HomePage() {
  const [activities, setActivities] = useState<ActivityForHomepage[]>([])
  const [featuredActivities, setFeaturedActivities] = useState<ActivityForHomepage[]>([])
  const [recommendedActivities, setRecommendedActivities] = useState<ActivityForHomepage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        
        const [featured, recommended] = await Promise.all([
          supabaseActivityService.getFeaturedActivities(4),
          supabaseActivityService.getRecommendedActivities(8)
        ])
        
        setFeaturedActivities(supabaseActivityService.convertToHomepageFormat(featured))
        setRecommendedActivities(supabaseActivityService.convertToHomepageFormat(recommended))
        setActivities(supabaseActivityService.convertToHomepageFormat(recommended))

      } catch (error) {
        console.error("Error fetching initial activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        let fetchedActivities
        if (selectedCategory) {
          fetchedActivities = await supabaseActivityService.getActivitiesByCategory(selectedCategory)
        } else {
          fetchedActivities = await supabaseActivityService.getRecommendedActivities(8)
        }
        setActivities(supabaseActivityService.convertToHomepageFormat(fetchedActivities))
      } catch (error) {
        console.error(`Error fetching activities for category ${selectedCategory}:`, error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [selectedCategory])


  const handleSelectCategory = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
  };

  const renderActivityRows = () => {
    if (loading) {
      return (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      )
    }

    if (selectedCategory) {
      return <ActivityRow title={selectedCategory} activities={activities} />
    }

    return (
      <>
        {recommendedActivities.length > 0 && (
          <ActivityRow
            title="Recommended by Us"
            activities={recommendedActivities}
          />
        )}
        {featuredActivities.length > 0 && (
          <ActivityRow
            title="Featured Activities"
            activities={featuredActivities}
          />
        )}
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
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <SearchBar />
          </div>
        </section>

        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <CategoryNav selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />
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


import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { CategorySection } from "@/components/home/CategorySection"
import { useLanguage } from "@/contexts/LanguageContext"
import { BottomActionButtons } from "@/components/layout/BottomActionButtons"
import { FloatingCart } from "@/components/layout/FloatingCart"
import { useState } from "react"

// Mock data for now since we need to fix the service issues
const getMockActivities = (t: any) => [
  {
    title: t("activities.doiSuthep.title"),
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed",
    price: 1800,
    location: t("activities.location.chiangMai"),
    rating: 4.8,
    href: "/activities/1"
  },
  {
    title: t("activities.cookingClass.title"),
    image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    price: 1440,
    location: t("activities.location.chiangMai"),
    rating: 5.0,
    href: "/activities/2"
  },
  {
    title: t("activities.elephantPark.title"),
    image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5",
    price: 3000,
    location: t("activities.location.chiangMai"),
    rating: 4.9,
    href: "/activities/3"
  },
  {
    title: t("activities.massage.title"),
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
    price: 2160,
    location: t("activities.location.chiangMai"),
    rating: 4.7,
    href: "/activities/4"
  },
  {
    title: t("activities.biking.title"),
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
    price: 2500,
    location: t("activities.location.chiangMai"),
    rating: 4.6,
    href: "/activities/5"
  },
  {
    title: t("activities.foodTour.title"),
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    price: 1200,
    location: t("activities.location.chiangMai"),
    rating: 4.9,
    href: "/activities/6"
  }
]

const getMockCategories = (t: any) => [
  { id: 1, name: t("category.adventure") },
  { id: 2, name: t("category.culture") },
  { id: 3, name: t("home.categories.foodCuisine") },
  { id: 4, name: t("category.nature") },
  { id: 5, name: t("home.categories.landmarks") },
  { id: 6, name: t("home.categories.wellness") },
  { id: 7, name: t("home.categories.workshop") }
]

export default function HomePage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  const mockActivities = getMockActivities(t)
  const mockCategories = getMockCategories(t)

  const getActivitiesByCategory = (categoryName: string) => {
    // Return different activities for each category
    switch (categoryName) {
      case t("category.adventure"):
        return [mockActivities[4], mockActivities[2]]
      case t("category.culture"):
        return [mockActivities[0], mockActivities[5]]
      case t("home.categories.foodCuisine"):
        return [mockActivities[1], mockActivities[5]]
      case t("category.nature"):
        return [mockActivities[2]]
      case t("home.categories.landmarks"):
        return [mockActivities[0]]
      case t("home.categories.wellness"):
        return [mockActivities[3]]
      case t("home.categories.workshop"):
        return [mockActivities[1], mockActivities[3]]
      default:
        return mockActivities.slice(0, 3)
    }
  }

  const getRecommendedActivities = () => {
    return mockActivities
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("home.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {t("home.hero.title")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {t("home.hero.subtitle")}
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <SearchBar />
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t("home.categories.title")}
            </h2>
            <CategorySection categories={mockCategories} />
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Recommended Activities */}
            <ActivityRow
              title={t("home.recommended.title")}
              activities={getRecommendedActivities()}
              showViewAll={true}
              viewAllHref="/activities"
            />

            {/* Category-based Activity Rows */}
            {mockCategories.map((category) => {
              const categoryActivities = getActivitiesByCategory(category.name)
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

        {/* Bottom Action Buttons */}
        <BottomActionButtons />
        
        {/* Floating Cart */}
        <FloatingCart />
      </div>

      <Footer />
    </>
  )
}

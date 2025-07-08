import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { CategorySection } from "@/components/home/CategorySection"
import { BottomActionButtons } from "@/components/layout/BottomActionButtons"
import { FloatingCart } from "@/components/layout/FloatingCart"
import { useState, useEffect } from "react"

// Mock data for now since we need to fix the service issues
const mockActivities = [
  {
    title: "Doi Suthep Temple & Hmong Village Tour",
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed",
    price: 1800,
    location: "Chiang Mai",
    rating: 4.8,
    href: "/activities/1"
  },
  {
    title: "Traditional Thai Cooking Class",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    price: 1440,
    location: "Chiang Mai",
    rating: 5.0,
    href: "/activities/2"
  },
  {
    title: "Elephant Nature Park Experience",
    image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5",
    price: 3000,
    location: "Chiang Mai",
    rating: 4.9,
    href: "/activities/3"
  },
  {
    title: "Thai Massage Workshop",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
    price: 2160,
    location: "Chiang Mai",
    rating: 4.7,
    href: "/activities/4"
  },
  {
    title: "White Water Rafting Adventure",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
    price: 2500,
    location: "Chiang Mai",
    rating: 4.6,
    href: "/activities/5"
  },
  {
    title: "Night Bazaar Food Tour",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    price: 1200,
    location: "Chiang Mai",
    rating: 4.9,
    href: "/activities/6"
  }
]

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getActivitiesByCategory = (categoryName: string) => {
    // Return different activities for each category
    switch (categoryName) {
      case "Adventure":
        return [mockActivities[4], mockActivities[2]]
      case "Culture":
        return [mockActivities[0], mockActivities[5]]
      case "Food & Cuisine":
        return [mockActivities[1], mockActivities[5]]
      case "Nature":
        return [mockActivities[2]]
      case "Landmarks":
        return [mockActivities[0]]
      case "Wellness":
        return [mockActivities[3]]
      case "Workshop":
        return [mockActivities[1], mockActivities[3]]
      default:
        return mockActivities.slice(0, 3)
    }
  }

  const getRecommendedActivities = () => {
    return mockActivities
  }

  const featuredActivities = mockActivities.slice(0, 4)
  const categories = mockCategories
  const categoryActivities = categories.map(category => getActivitiesByCategory(category.name))

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading...</p>
        </div>
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
            <ActivityRow
              title="Recommended by Us"
              activities={getRecommendedActivities()}
            />

            {/* Featured Activities */}
            <ActivityRow
              title="Featured Activities"
              activities={featuredActivities}
            />

            {/* Category-based Activity Rows */}
            {categories.map((category, index) => (
              <ActivityRow
                key={category.id}
                title={category.name}
                activities={categoryActivities[index] || []}
              />
            ))}
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

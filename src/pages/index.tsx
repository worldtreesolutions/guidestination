import Head from "next/head"
import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CategoryNav } from "@/components/home/CategoryNav"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { BottomActionButtons } from "@/components/layout/BottomActionButtons"
import { FloatingCart } from "@/components/layout/FloatingCart"
import { supabase } from "@/integrations/supabase/client"
import categoryService from "@/services/categoryService"
import { SupabaseActivity } from "@/types/activity"

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface HomePageProps {
  featuredActivities: SupabaseActivity[];
  recommendedActivities: SupabaseActivity[];
  activitiesByCategory: { [key: string]: SupabaseActivity[] };
  categories: Category[];
}

export default function HomePage({
  activitiesByCategory,
  categories,
}: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleSelectCategory = (categoryName: string | null) => {
    setSelectedCategory(categoryName)
  }

  const renderActivityRows = () => {
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
              activities={activities as SupabaseActivity[]}
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

export async function getServerSideProps() {
  try {
    // Fetch featured activities (first 6 activities)
    const { data: featuredActivitiesData } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true)
      .limit(6)

    // Fetch recommended activities (random selection)
    const { data: recommendedActivitiesData } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true)
      .limit(8)

    const categories = await categoryService.getAllCategories()
    const activitiesByCategory: { [key: string]: SupabaseActivity[] } = {};

    // Fetch activities for each category
    await Promise.all(
      categories.slice(0, 4).map(async (category: Category) => {
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .eq('is_active', true)
          .eq('category', category.name)
          .limit(10)
        
        activitiesByCategory[category.name] = activities || [];
      })
    )

    return {
      props: {
        featuredActivities: featuredActivitiesData || [],
        recommendedActivities: recommendedActivitiesData || [],
        activitiesByCategory,
        categories,
      },
    }
  } catch (error) {
    console.error("Error fetching data for homepage:", error)
    return {
      props: {
        featuredActivities: [],
        recommendedActivities: [],
        activitiesByCategory: {},
        categories: [],
      },
    }
  }
}
  

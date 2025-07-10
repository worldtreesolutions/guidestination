import { ExcursionPlanner } from "@/components/activities/ExcursionPlanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Head from "next/head"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import { supabaseActivityService } from "@/services/supabaseActivityService"
import { SupabaseActivity } from "@/types/activity"
import { usePlanning } from "@/contexts/PlanningContext"
import { useState, useEffect } from "react"

export default function PlanningPage() {
  const { selectedActivities, scheduledActivities } = usePlanning()
  const [activities, setActivities] = useState<SupabaseActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      const activitiesData = await supabaseActivityService.getActivities({})
      setActivities(activitiesData)
      setLoading(false)
    }
    fetchActivities()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8">
        <ExcursionPlanner activities={activities} onPlanComplete={(plan) => console.log(plan)} />
      </main>
      <Footer />
    </div>
  )
}

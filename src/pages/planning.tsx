import { ExcursionPlanner } from "@/components/activities/ExcursionPlanner"
import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Head from "next/head"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import activityService from "@/services/activityService"
import { Activity, SupabaseActivity } from "@/types/activity"
import { PlanningProvider, usePlanning } from "@/contexts/PlanningContext"
import { useState, useEffect, useContext, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

function Planner() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const planningContext = usePlanning()

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const data = await activityService.getActivities()
      setActivities(data)
    } catch (error) {
      console.error("Error fetching activities:", error)
      toast({
        title: "Error",
        description: "Failed to fetch activities.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ExcursionPlanner activities={activities as unknown as SupabaseActivity[]} onPlanComplete={(plan) => console.log(plan)} />
  )
}


export default function PlanningPage() {
  return (
    <PlanningProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-8">
          <Planner />
        </main>
        <Footer />
      </div>
    </PlanningProvider>
  )
}

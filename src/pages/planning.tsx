import { ExcursionPlanner } from "@/components/activities/ExcursionPlanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Head from "next/head"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import { supabaseActivityService } from "@/services/supabaseActivityService"
import { SupabaseActivity } from "@/types/activity"
import { PlanningContext, usePlanning } from "@/contexts/PlanningContext"
import { useState, useEffect, useContext, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export default function PlanningPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<SupabaseActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedActivities, addActivity, removeActivity, clearActivities } =
    useContext(PlanningContext)

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const data = await supabaseActivityService.getAllActivities()
      setActivities(data as SupabaseActivity[])
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8">
        <ExcursionPlanner activities={activities} onPlanComplete={(plan) => console.log(plan)} />
      </main>
      <Footer />
    </div>
  )
}

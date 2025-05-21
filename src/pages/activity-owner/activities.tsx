
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type Activity = Database["public"]["Tables"]["activities"]["Row"]

export default function ActivitiesPage() {
  const { user } = useAuth()
  const [dataLoading, setDataLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return
      
      setDataLoading(true)
      try {
        const { data: ownerResult, error: ownerError } = await supabase
          .from("activity_owners")
          .select("provider_id")
          .eq("user_id", user.id)
          .single()

        if (ownerError) {
          console.error("Error fetching owner:", ownerError)
          return
        }

        if (ownerResult) {
          const { data: activitiesData, error: activitiesError } = await supabase
            .from("activities")
            .select("*")
            .eq("provider_id", ownerResult.provider_id)

          if (activitiesError) {
            console.error("Error fetching activities:", activitiesError)
            return
          }

          setActivities(activitiesData || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchActivities()
  }, [user])

  if (dataLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>My Activities</h1>
      {activities.length === 0 ? (
        <p>No activities found. Start by creating a new activity.</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.activity_id}>
            <h2>{activity.title}</h2>
            <p>{activity.description}</p>
          </div>
        ))
      )}
    </div>
  )
}

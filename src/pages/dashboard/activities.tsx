
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Activity, ActivityStatus } from "@/types/activity"
import { ActivityCard } from "@/components/dashboard/activities/ActivityCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ActivitiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setActivities(data as Activity[])
    } catch (error) {
      console.error("Error fetching activities:", error)
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("activity_id", activityId)

      if (error) throw error

      setActivities((prev) =>
        prev.filter((activity) => activity.activity_id !== activityId)
      )

      toast({
        title: "Success",
        description: "Activity deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting activity:", error)
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (activityId: string, newStatus: ActivityStatus) => {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ status: newStatus })
        .eq("activity_id", activityId)

      if (error) throw error

      setActivities((prev) =>
        prev.map((activity) =>
          activity.activity_id === activityId
            ? { ...activity, status: newStatus }
            : activity
        )
      )

      toast({
        title: "Success",
        description: "Activity status updated successfully",
      })
    } catch (error) {
      console.error("Error updating activity status:", error)
      toast({
        title: "Error",
        description: "Failed to update activity status",
        variant: "destructive",
      })
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Activities</h1>
        <Button onClick={() => router.push("/dashboard/activities/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Activity
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative max-w-sm">
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: string) => setStatusFilter(value as ActivityStatus | "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div>Loading activities...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No activities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.activity_id}
              activity={activity}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

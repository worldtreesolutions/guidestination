
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit3, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"

type Activity = Database["public"]["Tables"]["activities"]["Row"] & {
  category: Database["public"]["Tables"]["categories"]["Row"] | null
}

export default function ActivityOwnerActivitiesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/activity-owner/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return

      setDataLoading(true)
      try {
        const {  ownerData, error: ownerError } = await supabase
          .from("activity_owners")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (ownerError || !ownerData) {
          console.error("Error fetching activity owner:", ownerError)
          toast({
            title: "Error",
            description: "Could not fetch your provider details. Please try again.",
            variant: "destructive",
          })
          setDataLoading(false)
          return
        }

        const ownerId = ownerData.id

        const { data, error } = await supabase
          .from("activities")
          .select(`
            *,
            category:categories(*)
          `)
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching activities:", error)
          toast({
            title: "Error",
            description: "Could not fetch activities. Please try again.",
            variant: "destructive",
          })
        } else if (data) {
          setActivities(data as Activity[])
        }
      } catch (e) {
        console.error("Unexpected error fetching activities:", e)
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      } finally {
        setDataLoading(false)
      }
    }

    if (user) {
      fetchActivities()
    }
  }, [user, toast])

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Are you sure you want to delete this activity? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId)

      if (error) {
        throw error
      }

      setActivities(activities.filter((act) => act.id !== activityId))
      toast({
        title: "Success",
        description: "Activity deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting activity:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete activity. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-150px)]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null; // Or a message indicating redirection
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Activities</h1>
          <p className="text-muted-foreground">Manage your listed activities and create new ones.</p>
        </div>
        <Link href="/dashboard/activities/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Activity
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity List</CardTitle>
          <CardDescription>
            A list of all activities you have created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground mb-2">No activities found.</p>
              <p className="text-sm text-muted-foreground">Get started by adding your first activity!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (THB)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell>{activity.category?.name || "N/A"}</TableCell>
                    <TableCell>{activity.price ? activity.price.toLocaleString() : "N/A"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          activity.status === "published" ? "default" :
                          activity.status === "draft" ? "secondary" :
                          activity.status === "archived" ? "outline" : "destructive"
                        }
                        className={
                          activity.status === "published" ? "bg-green-500 hover:bg-green-600 text-white" :
                          activity.status === "pending_approval" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""
                        }
                      >
                        {activity.status ? activity.status.replace("_", " ").toUpperCase() : "UNKNOWN"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/activities/${activity.id}`} passHref>
                          <Button variant="outline" size="icon" aria-label="Edit Activity">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDeleteActivity(activity.id)}
                          aria-label="Delete Activity"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                         <Link href={`/activities/${activity.slug || activity.id}`} passHref target="_blank">
                          <Button variant="outline" size="icon" aria-label="View Activity">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {activities.length > 0 && (
          <CardFooter className="text-xs text-muted-foreground">
            Showing {activities.length} activit{activities.length === 1 ? "y" : "ies"}.
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  )
}
